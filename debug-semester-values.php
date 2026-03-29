<?php
require_once('classes/database.class.php');

$db = new Database();

echo "<h2>Check class_schedule Semester Values</h2>";

// Check what semester/school_year values are actually in class_schedule
$sql = "SELECT DISTINCT semester, school_year FROM class_schedule";
$query = $db->connect()->prepare($sql);

if ($query->execute()) {
    $data = $query->fetchAll(PDO::FETCH_ASSOC);
    echo "<h3>Semester/School Year values in class_schedule:</h3>";
    if (empty($data)) {
        echo "<p><strong>NO SEMESTER DATA FOUND</strong></p>";
    } else {
        echo "<table border='1'>";
        echo "<tr><th>semester</th><th>school_year</th></tr>";
        foreach ($data as $row) {
            echo "<tr>";
            echo "<td>{$row['semester']}</td>";
            echo "<td>{$row['school_year']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
}

// Check all class_schedule data
echo "<h3>All class_schedule data:</h3>";
$sql = "SELECT * FROM class_schedule ORDER BY day, start_time";
$query = $db->connect()->prepare($sql);

if ($query->execute()) {
    $data = $query->fetchAll(PDO::FETCH_ASSOC);
    if (empty($data)) {
        echo "<p><strong>NO DATA in class_schedule</strong></p>";
    } else {
        echo "<table border='1'>";
        echo "<tr><th>class_id</th><th>subject_type</th><th>day</th><th>start_time</th><th>end_time</th><th>semester</th><th>school_year</th><th>room_code</th><th>room_no</th></tr>";
        foreach ($data as $row) {
            echo "<tr>";
            echo "<td>{$row['class_id']}</td>";
            echo "<td>{$row['subject_type']}</td>";
            echo "<td>{$row['day']}</td>";
            echo "<td>{$row['start_time']}</td>";
            echo "<td>{$row['end_time']}</td>";
            echo "<td>{$row['semester']}</td>";
            echo "<td>{$row['school_year']}</td>";
            echo "<td>{$row['room_code']}</td>";
            echo "<td>{$row['room_no']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
}
?>
