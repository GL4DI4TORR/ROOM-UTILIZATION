<?php
require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

$roomObj = new RoomStatus();

// Ensure semester is picked
if (!isset($_SESSION['selected_semester_id'])) {
    echo json_encode(['status' => 'error', 'generalErr' => 'No semester selected.']);
    exit;
}

$semester_PK = $_SESSION['selected_semester_id'];
$split_PK = explode('|', $semester_PK);
$semester = $split_PK[0];
$school_year = $split_PK[1];

$roomParam = clean_input($_GET['room'] ?? '');
$dayParam = clean_input($_GET['day'] ?? '');

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

$schedule = $roomObj->fetchSchedule($semester, $school_year, $roomCode, $roomNo, $day);

header('Content-Type: application/json');
echo json_encode(['status' => 'success', 'data' => $schedule]);

