<?php
require_once('classes/database.class.php');
require_once('classes/room-status.class.php');

$db = new Database();
$roomObj = new RoomStatus();

// Hardcode semester values based on what we saw in logs
$roomObj->semester = '1';
$roomObj->school_year = '2024-2025';

echo "<h2>Debug showAllStatus() Method</h2>";
echo "<h3>Semester Data:</h3>";
echo "<p>semester: " . $roomObj->semester . "</p>";
echo "<p>school_year: " . $roomObj->school_year . "</p>";

echo "<h3>Raw SQL Query Results:</h3>";
$results = $roomObj->showAllStatus();

if (empty($results)) {
    echo "<p><strong>NO RESULTS from showAllStatus()</strong></p>";
} else {
    echo "<table border='1'>";
    echo "<tr><th>class_day</th><th>class_id</th><th>subject_type</th><th>room_name</th><th>start_time</th><th>end_time</th><th>faculty_name</th><th>room_status</th></tr>";
    foreach ($results as $row) {
        echo "<tr>";
        echo "<td>{$row['class_day']}</td>";
        echo "<td>{$row['class_id']}</td>";
        echo "<td>{$row['subject_type']}</td>";
        echo "<td>{$row['room_name']}</td>";
        echo "<td>{$row['start_time']}</td>";
        echo "<td>{$row['end_time']}</td>";
        echo "<td>{$row['faculty_name']}</td>";
        echo "<td>{$row['room_status']}</td>";
        echo "</tr>";
    }
    echo "</table>";
}

echo "<h3>Direct class_schedule Query:</h3>";
$sql = "SELECT sched.*, CONCAT(sched.room_code, ' ', sched.room_no) AS room_name
          FROM class_schedule sched 
          WHERE sched.semester = :semester AND sched.school_year = :school_year
          ORDER BY sched.day, sched.start_time";

$query = $db->connect()->prepare($sql);
$query->bindParam(':semester', $roomObj->semester);
$query->bindParam(':school_year', $roomObj->school_year);

if ($query->execute()) {
    $data = $query->fetchAll(PDO::FETCH_ASSOC);
    if (empty($data)) {
        echo "<p><strong>NO RESULTS from direct class_schedule query</strong></p>";
    } else {
        echo "<table border='1'>";
        echo "<tr><th>class_id</th><th>subject_type</th><th>day</th><th>start_time</th><th>end_time</th><th>room_name</th><th>status</th></tr>";
        foreach ($data as $row) {
            echo "<tr>";
            echo "<td>{$row['class_id']}</td>";
            echo "<td>{$row['subject_type']}</td>";
            echo "<td>{$row['day']}</td>";
            echo "<td>{$row['start_time']}</td>";
            echo "<td>{$row['end_time']}</td>";
            echo "<td>{$row['room_name']}</td>";
            echo "<td>{$row['status']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
} else {
    echo "<p><strong>QUERY ERROR:</strong></p>";
    print_r($query->errorInfo());
}
?>
