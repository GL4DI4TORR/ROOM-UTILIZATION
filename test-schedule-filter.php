<?php
// Test script to verify schedule filtering by status
require_once 'classes/room-status.class.php';
session_start();

// Mock session data for testing
$_SESSION['selected_semester_id'] = '1|2024-2025';

$roomObj = new RoomStatus();
$roomObj->semester = '1';
$roomObj->school_year = '2024-2025';

echo "<h2>Testing Schedule Filter by Status</h2>";

// Test fetchSchedule with status filter
echo "<h3>Occupied Classes Only (Should show in schedule):</h3>";
$occupiedSchedule = $roomObj->fetchSchedule('1', '2024-2025', null, null, null);
echo "<pre>";
print_r($occupiedSchedule);
echo "</pre>";

// Test showAllStatus to see all classes regardless of status
echo "<h3>All Classes (From showAllStatus):</h3>";
$allStatus = $roomObj->showAllStatus();
echo "<pre>";
print_r($allStatus);
echo "</pre>";

// Count occupied vs available
$occupiedCount = 0;
$availableCount = 0;
foreach ($allStatus as $status) {
    if ($status['room_status'] === 'OCCUPIED') {
        $occupiedCount++;
    } elseif ($status['room_status'] === 'AVAILABLE') {
        $availableCount++;
    }
}

echo "<h3>Status Summary:</h3>";
echo "<p>Occupied: $occupiedCount</p>";
echo "<p>Available: $availableCount</p>";
echo "<p>Total in Schedule: " . count($occupiedSchedule) . "</p>";
echo "<p>Should match Occupied count if filter is working correctly</p>";
?>
