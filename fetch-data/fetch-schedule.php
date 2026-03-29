<?php
session_start();
require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

$roomObj = new RoomStatus();

// Debug: Check what's in session
error_log("Session data in fetch-schedule.php: " . print_r($_SESSION, true));

// Ensure semester is picked
if (!isset($_SESSION['selected_semester_id'])) {
    echo json_encode(['status' => 'error', 'generalErr' => 'No semester selected. Please select a semester first.']);
    exit;
}

$semester_PK = $_SESSION['selected_semester_id'];
$split_PK = explode('|', $semester_PK);
$semester = $split_PK[0];
$school_year = $split_PK[1];

$roomParam = clean_input($_GET['room'] ?? '');
$dayParam = clean_input($_GET['day'] ?? '');

// Debug: Check what parameters we received
error_log("Parameters received: room=" . ($roomParam ?? 'null') . ", day=" . ($dayParam ?? 'null'));

$roomCode = null;
$roomNo = null;

if (!empty($roomParam)) {
    $roomParts = explode('|', $roomParam);
    if (count($roomParts) === 2) {
        $roomCode = $roomParts[0];
        $roomNo = $roomParts[1];
    }
}

$day = !empty($dayParam) ? $dayParam : null;

// Debug: Check semester data
error_log("Semester data: semester=$semester, school_year=$school_year");

$schedule = $roomObj->fetchSchedule($semester, $school_year, $roomCode, $roomNo, $day);

// Debug: Check results
error_log("Schedule results: " . print_r($schedule, true));

header('Content-Type: application/json');
echo json_encode(['status' => 'success', 'data' => $schedule]);

