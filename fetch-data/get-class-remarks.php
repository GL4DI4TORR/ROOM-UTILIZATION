<?php
session_start();
require_once '../classes/room-status.class.php';
require_once '../tools/functions.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$response = ['status' => 'error', 'remarks' => ''];

try {
    if (!isset($_POST['class_id']) || !isset($_POST['subject_type']) || !isset($_POST['day'])) {
        $response['remarks'] = '';
        echo json_encode($response);
        exit;
    }

    $class_id = trim($_POST['class_id']);
    $subject_type = trim($_POST['subject_type']);
    $day = trim($_POST['day']);

    $roomObj = new RoomStatus();

    // populate semester from session if available
    if (isset($_SESSION['selected_semester_id']) && !empty($_SESSION['selected_semester_id'])) {
        $parts = explode('|', $_SESSION['selected_semester_id']);
        $roomObj->semester = $parts[0];
        $roomObj->school_year = $parts[1] ?? '';
    }

    $roomObj->class_id = $class_id;
    $roomObj->subject_type = $subject_type;
    $roomObj->day_id = $day;

    $rows = $roomObj->getClassScheduleDetail();
    if ($rows && count($rows) > 0) {
        $remarks = $rows[0]['remarks'] ?? '';
        $response['status'] = 'success';
        $response['remarks'] = $remarks;
    } else {
        $response['status'] = 'success';
        $response['remarks'] = '';
    }
} catch (Exception $e) {
    error_log('get-class-remarks error: ' . $e->getMessage());
    $response['status'] = 'error';
    $response['remarks'] = '';
}

echo json_encode($response);
