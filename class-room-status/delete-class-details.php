<?php

session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

// Set content type header
header('Content-Type: application/json');

// Debug log to confirm this script is being called
error_log("delete-class-details.php script accessed at " . date('Y-m-d H:i:s'));

$class_id = $subject_id = '';

$roomObj = new RoomStatus();

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    error_log("POST data received: " . print_r($_POST, true));
    
    $class_id = clean_input($_POST['class-id']);
    
    // Handle both possible field names for backward compatibility
    if(isset($_POST['subtype-id'])){
        $subtype_id = clean_input($_POST['subtype-id']);
    } elseif(isset($_POST['subject-type'])){
        $subtype_id = clean_input($_POST['subject-type']);
    } else {
        $subtype_id = '';
    }
    
    error_log("Processed data: class_id=$class_id, subtype_id=$subtype_id");

    $roomObj->class_id = $class_id;
    $roomObj->subject_type = $subtype_id;

    if($roomObj->deleteClassDetails()){
        echo json_encode(['status' => 'success', 'debug' => [
            'class_id deleted' => $roomObj->log_cid,
        ]]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Something went wrong when deleting the class details.']);
    }
    exit;

}

?>
