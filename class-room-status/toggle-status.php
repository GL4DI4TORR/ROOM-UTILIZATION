<?php
require_once '../classes/room-status.class.php';
session_start();

header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }
    
    $classId = $data['classId'] ?? '';
    $subjectType = $data['subjectType'] ?? '';
    $classDay = $data['classDay'] ?? '';
    
    // Debug log
    error_log("Toggle status request: classId=$classId, subjectType=$subjectType, classDay=$classDay");
    
    if (empty($classId) || empty($subjectType) || empty($classDay)) {
        throw new Exception('Missing required parameters: ' . json_encode($data));
    }
    
    // Get semester info from session
    if (!isset($_SESSION['selected_semester_id'])) {
        throw new Exception('Semester not selected');
    }
    
    $semester_PK = $_SESSION['selected_semester_id'];
    $split_PK = explode('|', $semester_PK);
    
    // Debug log
    error_log("Semester info: " . json_encode($split_PK));
    
    // Create RoomStatus object and set properties
    $roomObj = new RoomStatus();
    $roomObj->class_id = $classId;
    $roomObj->subject_type = $subjectType;
    $roomObj->day_id = $classDay;
    $roomObj->semester = $split_PK[0];
    $roomObj->school_year = $split_PK[1];
    
    // Get current status before toggle
    $currentStatus = $roomObj->getCurrentStatus();
    error_log("Current status: $currentStatus");
    
    // Toggle the status
    if ($roomObj->toggleClassStatus()) {
        // Get the updated status to return to client
        $updatedStatus = $roomObj->getCurrentStatus();
        error_log("Updated status: $updatedStatus");
        
        echo json_encode([
            'success' => true,
            'newStatus' => $updatedStatus,
            'oldStatus' => $currentStatus,
            'message' => 'Status updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update status');
    }
    
} catch (Exception $e) {
    error_log("Toggle status error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
