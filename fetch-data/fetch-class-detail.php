<?php
require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

session_start();
header('Content-Type: application/json');

$roomObj = new RoomStatus();
$class_id = clean_input($_GET['class_id'] ?? '');
$subject_type = clean_input($_GET['subject_type'] ?? '');
$day = clean_input($_GET['day'] ?? '');

// Debug logging
error_log("fetch-class-detail.php called with class_id=$class_id, subject_type=$subject_type, day=$day");

// Get semester info
if (!isset($_SESSION['selected_semester_id'])) {
    echo json_encode(['error' => 'No semester selected']);
    exit;
}

$semester_PK = $_SESSION['selected_semester_id'];
$split_PK = explode('|', $semester_PK);
$semester = $split_PK[0];
$school_year = $split_PK[1];

// Set object properties
$roomObj->class_id = $class_id;
$roomObj->subject_type = $subject_type;
$roomObj->day_id = $day;
$roomObj->semester = $semester;
$roomObj->school_year = $school_year;

// Get class schedule details
$class_details = $roomObj->getClassScheduleDetail();

// Debug what was returned
error_log("getClassScheduleDetail returned: " . print_r($class_details, true));

echo json_encode($class_details);
?>