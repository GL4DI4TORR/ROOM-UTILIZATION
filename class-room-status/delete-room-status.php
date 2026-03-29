<?php

session_start();

// Test if this file is being reached
error_log("delete-room-status.php file accessed at " . date('Y-m-d H:i:s'));
file_put_contents('debug-delete.txt', "delete-room-status.php accessed at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

// Debug request method
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
file_put_contents('debug-delete.txt', "Request method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

// Debug POST data
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    error_log("POST data: " . print_r($_POST, true));
    file_put_contents('debug-delete.txt', "POST data: " . print_r($_POST, true) . "\n", FILE_APPEND);
} else {
    error_log("Not a POST request");
    file_put_contents('debug-delete.txt', "Not a POST request\n", FILE_APPEND);
}

require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

$class_id = '';
$subject_type = $class_day = '';

$roomObj = new RoomStatus();

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $class_id = clean_input($_POST['class-id']);
    $subject_type = clean_input($_POST['subject-type']);
    $class_day = clean_input($_POST['class-day']);

    // Debug logging
    error_log("Delete request received: class_id=$class_id, subject_type=$subject_type, class_day=$class_day");

    $roomObj->class_id = $class_id;
    $roomObj->subject_type = $subject_type;
    $roomObj->day_id = $class_day;

    if($roomObj->deleteClassSchedule()){
        error_log("Delete successful for class_id=$class_id");
        echo json_encode(['status' => 'success']);
    } else {
        error_log("Delete failed for class_id=$class_id");
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete room status']);
    }
    exit;

}

?>
