<?php
require_once('classes/database.class.php');
require_once('classes/room-status.class.php');

$db = new Database();
$roomObj = new RoomStatus();

echo "<h2>Debug: Schedule Entries</h2>";

// Check class_details table
echo "<h3>Class Details:</h3>";
$sql1 = "SELECT * FROM class_details ORDER BY class_id";
$query1 = $db->connect()->prepare($sql1);
if ($query1->execute()) {
    $classes = $query1->fetchAll(PDO::FETCH_ASSOC);
    echo "<table border='1'>";
    echo "<tr><th>class_id</th><th>subject_id</th><th>subject_type</th><th>teacher_assigned</th></tr>";
    foreach ($classes as $class) {
        echo "<tr><td>{$class['class_id']}</td><td>{$class['subject_id']}</td><td>{$class['subject_type']}</td><td>{$class['teacher_assigned']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "Error fetching class details: " . print_r($query1->errorInfo(), true);
}

// Check class_schedule table
echo "<h3>Class Schedule:</h3>";
$sql2 = "SELECT * FROM class_schedule ORDER BY class_id, day";
$query2 = $db->connect()->prepare($sql2);
if ($query2->execute()) {
    $schedules = $query2->fetchAll(PDO::FETCH_ASSOC);
    echo "<table border='1'>";
    echo "<tr><th>class_id</th><th>subject_type</th><th>day</th><th>start_time</th><th>end_time</th><th>status</th><th>room_code</th><th>room_no</th></tr>";
    foreach ($schedules as $schedule) {
        echo "<tr><td>{$schedule['class_id']}</td><td>{$schedule['subject_type']}</td><td>{$schedule['day']}</td><td>{$schedule['start_time']}</td><td>{$schedule['end_time']}</td><td>{$schedule['status']}</td><td>{$schedule['room_code']}</td><td>{$schedule['room_no']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "Error fetching schedule: " . print_r($query2->errorInfo(), true);
}

// Test showAllStatus method
echo "<h3>showAllStatus() Result:</h3>";
try {
    $status = $roomObj->showAllStatus();
    echo "<table border='1'>";
    echo "<tr><th>class_id</th><th>subject_code</th><th>section_name</th><th>faculty_name</th><th>room_name</th><th>status</th></tr>";
    foreach ($status as $row) {
        echo "<tr><td>{$row['class_id']}</td><td>{$row['subject_code']}</td><td>{$row['section_name']}</td><td>{$row['faculty_name']}</td><td>{$row['room_name']}</td><td>{$row['room_status']}</td></tr>";
    }
    echo "</table>";
} catch (Exception $e) {
    echo "Error in showAllStatus: " . $e->getMessage();
}
?>
