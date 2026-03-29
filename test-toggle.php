<?php
// Simple test script to verify toggle functionality
require_once 'classes/room-status.class.php';
session_start();

// Mock session data for testing
$_SESSION['selected_semester_id'] = '1|2024-2025';

// Create test data
$roomObj = new RoomStatus();
$roomObj->class_id = 'BSCS123451';
$roomObj->subject_type = 'LAB';
$roomObj->day_id = 'Wednesday';
$roomObj->semester = '1';
$roomObj->school_year = '2024-2025';

echo "<h2>Testing Toggle Functionality</h2>";

// Get current status
$currentStatus = $roomObj->getCurrentStatus();
echo "<p>Current Status: " . ($currentStatus ?: 'NULL') . "</p>";

// Toggle status
if ($roomObj->toggleClassStatus()) {
    echo "<p>Toggle successful!</p>";
    
    // Get new status
    $newStatus = $roomObj->getCurrentStatus();
    echo "<p>New Status: " . ($newStatus ?: 'NULL') . "</p>";
} else {
    echo "<p>Toggle failed!</p>";
}

// Show all status for verification
echo "<h3>All Status Records:</h3>";
$allStatus = $roomObj->showAllStatus();
echo "<pre>";
print_r($allStatus);
echo "</pre>";
?>
