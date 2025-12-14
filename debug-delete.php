<?php
require_once('tools/functions.php');
require_once('classes/room-status.class.php');

$roomObj = new RoomStatus();

echo "<h2>Debug: Check Database Contents</h2>";

// Check class_details table
echo "<h3>Class Details Table:</h3>";
$sql = "SELECT * FROM class_details ORDER BY class_id, subject_type";
$query = $roomObj->db->connect()->prepare($sql);
$query->execute();
$classDetails = $query->fetchAll(PDO::FETCH_ASSOC);

if (empty($classDetails)) {
    echo "<p>No records found in class_details table</p>";
} else {
    echo "<table border='1'><tr><th>Class ID</th><th>Subject Type</th><th>Subject ID</th><th>Course</th><th>Year</th><th>Section</th><th>Teacher</th></tr>";
    foreach ($classDetails as $row) {
        echo "<tr><td>{$row['class_id']}</td><td>{$row['subject_type']}</td><td>{$row['subject_id']}</td><td>{$row['course_abbr']}</td><td>{$row['year_level']}</td><td>{$row['section']}</td><td>{$row['teacher_assigned']}</td></tr>";
    }
    echo "</table>";
}

// Check class_schedule table
echo "<h3>Class Schedule Table:</h3>";
$sql = "SELECT * FROM class_schedule ORDER BY class_id, subject_type, day";
$query = $roomObj->db->connect()->prepare($sql);
$query->execute();
$classSchedule = $query->fetchAll(PDO::FETCH_ASSOC);

if (empty($classSchedule)) {
    echo "<p>No records found in class_schedule table</p>";
} else {
    echo "<table border='1'><tr><th>Class ID</th><th>Subject Type</th><th>Day</th><th>Start Time</th><th>End Time</th><th>Status</th><th>Room</th></tr>";
    foreach ($classSchedule as $row) {
        echo "<tr><td>{$row['class_id']}</td><td>{$row['subject_type']}</td><td>{$row['day']}</td><td>{$row['start_time']}</td><td>{$row['end_time']}</td><td>{$row['status']}</td><td>{$row['room_code']} {$row['room_no']}</td></tr>";
    }
    echo "</table>";
}

// Check showAllStatus output
echo "<h3>Show All Status Output:</h3>";
$semester_PK = $_SESSION['selected_semester_id'] ?? 'Not Set';
echo "<p>Current semester: $semester_PK</p>";

if (isset($_SESSION['selected_semester_id'])) {
    $split_PK = explode('|', $_SESSION['selected_semester_id']);
    $roomObj->semester = $split_PK[0];
    $roomObj->school_year = $split_PK[1];
    
    $statusData = $roomObj->showAllStatus();
    if (empty($statusData)) {
        echo "<p>No status data found</p>";
    } else {
        echo "<table border='1'><tr><th>Class ID</th><th>Subject</th><th>Section</th><th>Day</th><th>Time</th><th>Room</th><th>Status</th></tr>";
        foreach ($statusData as $row) {
            echo "<tr><td>{$row['class_id']}</td><td>{$row['subject_code']}</td><td>{$row['section_name']}</td><td>{$row['class_day']}</td><td>{$row['start_time']}-{$row['end_time']}</td><td>{$row['room_name']}</td><td>{$row['room_status']}</td></tr>";
        }
        echo "</table>";
    }
}
?>
