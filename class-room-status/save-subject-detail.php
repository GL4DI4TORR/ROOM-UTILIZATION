<?php
session_start();

require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

$subject_code = $description = $lab_units = $lec_units = '';
$generalErr = $subject_codeErr = $descriptionErr = $lab_unitsErr = $lec_unitsErr = '';

$roomObj = new RoomStatus();

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    error_log("POST data received: " . print_r($_POST, true));
    
    $subject_code = clean_input($_POST['subject-code']);
    $description = clean_input($_POST['description']);
    $lab_units = clean_input($_POST['lab-units']);
    $lec_units = clean_input($_POST['lec-units']);

    // Validation
    if(empty($subject_code)){
        $subject_codeErr = 'Subject code is required.';
    }

    if(empty($description)){
        $descriptionErr = 'Description is required.';
    }

    if($lab_units === ''){
        $lab_unitsErr = 'Lab units is required.';
    } elseif(!is_numeric($lab_units) || $lab_units < 0){
        $lab_unitsErr = 'Lab units must be a valid number.';
    }

    if($lec_units === ''){
        $lec_unitsErr = 'Lec units is required.';
    } elseif(!is_numeric($lec_units) || $lec_units < 0){
        $lec_unitsErr = 'Lec units must be a valid number.';
    }

    // Check if subject already exists
    if(empty($subject_codeErr)){
        $existing = $roomObj->checkSubjectExists($subject_code);
        if($existing){
            $subject_codeErr = 'Subject code already exists.';
        }
    }

    if(!empty($subject_codeErr) || !empty($descriptionErr) || !empty($lab_unitsErr) || !empty($lec_unitsErr)){
        echo json_encode([
            'status' => 'error',
            'subject_codeErr' => $subject_codeErr,
            'descriptionErr' => $descriptionErr,
            'lab_unitsErr' => $lab_unitsErr,
            'lec_unitsErr' => $lec_unitsErr
        ]);
        exit;
    }

    // Insert the subject
    $total_units = $lab_units + $lec_units;
    
    try {
        $sql = "INSERT INTO subject_details (subject_code, description, total_units, lec_units, lab_units, subject_prospectus_id) 
                VALUES (:subject_code, :description, :total_units, :lec_units, :lab_units, '2023-2024')";
        
        $query = $roomObj->db->connect()->prepare($sql);
        $query->bindParam(':subject_code', $subject_code);
        $query->bindParam(':description', $description);
        $query->bindParam(':total_units', $total_units);
        $query->bindParam(':lec_units', $lec_units);
        $query->bindParam(':lab_units', $lab_units);
        
        if($query->execute()){
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'generalErr' => 'Failed to add subject.']);
        }
    } catch(Exception $e){
        echo json_encode(['status' => 'error', 'generalErr' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}
?>