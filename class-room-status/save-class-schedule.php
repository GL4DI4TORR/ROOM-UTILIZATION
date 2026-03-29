<?php
session_start();
require_once '../tools/functions.php';
require_once '../classes/room-status.class.php';

$response = array('status' => '', 'message' => '');

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    try {
        // Debug: Log received data
        error_log("POST data received: " . json_encode($_POST));

        // Validate required fields
        $required = ['class-id','subject','day','room-code','room-no','start-time','end-time'];
        foreach ($required as $field) {
            if (empty($_POST[$field])) {
                $response['status'] = 'error';
                $response['message'] = "Missing required field: $field";
                error_log("save-class-schedule validation failed: missing $field");
                echo json_encode($response);
                exit;
            }
        }

        $class_id = clean_input($_POST['class-id']);
        $subject = clean_input($_POST['subject']);
        $day = clean_input($_POST['day']);
        $room_code = clean_input($_POST['room-code']);
        $room_no = clean_input($_POST['room-no']);
        $start_time = clean_input($_POST['start-time']);
        $end_time = clean_input($_POST['end-time']);

        // Debug: Log processed data
        error_log("Processed data - Class ID: $class_id, Subject: $subject, Day: $day, Room: $room_code $room_no, Time: $start_time - $end_time");

        // Get semester info
        if (empty($_SESSION['selected_semester_id'])) {
            $response['status'] = 'error';
            $response['message'] = 'No semester selected in session.';
            error_log('save-class-schedule: no selected_semester_id in session');
            echo json_encode($response);
            exit;
        }

        $semester_PK = $_SESSION['selected_semester_id'];
        $split_PK = explode('|', $semester_PK);
        $semester = $split_PK[0];
        $school_year = $split_PK[1];
        
        $roomObj = new RoomStatus();
        $roomObj->class_id = $class_id;
        $roomObj->subject_type = $subject;
        $roomObj->semester = $semester;
        $roomObj->school_year = $school_year;
        
        // First check if the record exists
        $checkSql = "SELECT * FROM class_schedule 
                     WHERE class_id = ? AND subject_type = ? AND semester = ? AND school_year = ?";
        $checkQuery = $roomObj->db->connect()->prepare($checkSql);
        $checkQuery->execute([$class_id, $subject, $semester, $school_year]);
        $existingRecord = $checkQuery->fetch();
        
        if ($existingRecord) {
            // Update existing record
            $sql = "UPDATE class_schedule 
                    SET day = ?, start_time = ?, end_time = ?, status = 'OCCUPIED', 
                        remarks = 'Class scheduled', room_code = ?, room_no = ?
                    WHERE class_id = ? AND subject_type = ? AND semester = ? AND school_year = ?";
            
            $query = $roomObj->db->connect()->prepare($sql);
            $result = $query->execute([$day, $start_time, $end_time, $room_code, $room_no, 
                                      $class_id, $subject, $semester, $school_year]);
        } else {
            // Insert new record
            $sql = "INSERT INTO class_schedule 
                    (class_id, subject_type, semester, school_year, day, start_time, end_time, 
                     status, remarks, room_code, room_no) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'OCCUPIED', 'Class scheduled', ?, ?)";
            
            $query = $roomObj->db->connect()->prepare($sql);
            $result = $query->execute([$class_id, $subject, $semester, $school_year, 
                                      $day, $start_time, $end_time, $room_code, $room_no]);
        }
        
        // Debug: Log database operation result
        error_log("Database operation result: " . ($result ? 'SUCCESS' : 'FAILED'));
        
        if($result) {
            $response['status'] = 'success';
            $response['message'] = 'Class scheduled successfully!';
        } else {
            $response['status'] = 'error';
            $response['message'] = 'Failed to schedule class.';
        }
        
    } catch(PDOException $e) {
        error_log("Database exception: " . $e->getMessage());
        $response['status'] = 'error';
        $response['message'] = 'Database error: ' . $e->getMessage();
    }
} else {
    error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    $response['status'] = 'error';
    $response['message'] = 'Invalid request method.';
}

// Debug: Log final response
error_log("Final response: " . json_encode($response));
echo json_encode($response);
?>
