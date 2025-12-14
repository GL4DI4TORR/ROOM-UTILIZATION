<?php
require_once('classes/database.class.php');
require_once('classes/room-status.class.php');

$db = new Database();
$roomObj = new RoomStatus();

// Check what's actually in faculty_list table
$sql = "SELECT faculty_id, user_id FROM faculty_list ORDER BY faculty_id";
$query = $db->connect()->prepare($sql);

if ($query->execute()) {
    $faculty = $query->fetchAll(PDO::FETCH_ASSOC);
    echo "<h2>Faculty List Contents:</h2>";
    echo "<table border='1'>";
    echo "<tr><th>faculty_id</th><th>user_id</th></tr>";
    
    foreach ($faculty as $f) {
        echo "<tr><td>{$f['faculty_id']}</td><td>{$f['user_id']}</td></tr>";
    }
    echo "</table>";
    
    echo "<h2>Valid faculty_id values for dropdown:</h2>";
    foreach ($faculty as $f) {
        echo "<option value='{$f['faculty_id']}'>Teacher {$f['faculty_id']}</option><br>";
    }
} else {
    echo "Error fetching faculty list: " . print_r($query->errorInfo(), true);
}

// Also check if there are any existing class_details to see what teacher_assigned values work
$sql2 = "SELECT DISTINCT teacher_assigned FROM class_details ORDER BY teacher_assigned";
$query2 = $db->connect()->prepare($sql2);

if ($query2->execute()) {
    $existing = $query2->fetchAll(PDO::FETCH_ASSOC);
    echo "<h2>Existing teacher_assigned values in class_details:</h2>";
    foreach ($existing as $e) {
        echo "- {$e['teacher_assigned']}<br>";
    }
}
?>
