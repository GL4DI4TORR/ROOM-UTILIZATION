<?php
require_once('classes/database.class.php');
require_once('classes/room-status.class.php');

$db = new Database();
$roomObj = new RoomStatus();

// Get current session semester
session_start();
$semester_PK = $_SESSION['selected_semester_id'];
$split_PK = explode('|', $semester_PK);
$semester = $split_PK[0];
$school_year = $split_PK[1];

echo "<h2>Fixing Schedule Entries</h2>";

// Delete old schedule entries without semester data
$sql_delete = "DELETE FROM class_schedule WHERE semester IS NULL OR semester = ''";
$query_delete = $db->connect()->prepare($sql_delete);
if ($query_delete->execute()) {
    echo "<p>Deleted old schedule entries: " . $query_delete->rowCount() . " rows</p>";
}

// Get all class details and create proper schedule entries
$sql_classes = "SELECT * FROM class_details";
$query_classes = $db->connect()->prepare($sql_classes);
if ($query_classes->execute()) {
    $classes = $query_classes->fetchAll(PDO::FETCH_ASSOC);
    
    $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    foreach ($classes as $class) {
        foreach ($days as $day) {
            $sql_insert = "INSERT INTO class_schedule 
                    (class_id, subject_type, day, start_time, end_time, status, remarks, room_code, room_no, semester, school_year) 
                    VALUES (?, ?, ?, '08:00:00', '09:00:00', 'AVAILABLE', 'No schedule yet', 'LR', 1, ?, ?)";
            
            $query_insert = $db->connect()->prepare($sql_insert);
            $query_insert->execute([
                $class['class_id'], 
                $class['subject_type'], 
                $day, 
                $semester, 
                $school_year
            ]);
        }
        echo "<p>Created schedule entries for class: {$class['class_id']} - {$class['subject_type']}</p>";
    }
}

echo "<h3>Updated Schedule Table:</h3>";
$sql_check = "SELECT * FROM class_schedule ORDER BY class_id, day";
$query_check = $db->connect()->prepare($sql_check);
if ($query_check->execute()) {
    $schedules = $query_check->fetchAll(PDO::FETCH_ASSOC);
    echo "<table border='1'>";
    echo "<tr><th>class_id</th><th>subject_type</th><th>day</th><th>semester</th><th>school_year</th><th>status</th></tr>";
    foreach ($schedules as $schedule) {
        echo "<tr><td>{$schedule['class_id']}</td><td>{$schedule['subject_type']}</td><td>{$schedule['day']}</td><td>{$schedule['semester']}</td><td>{$schedule['school_year']}</td><td>{$schedule['status']}</td></tr>";
    }
    echo "</table>";
}

echo "<p><a href='debug-schedule.php'>Check debug-schedule.php to verify the fix</a></p>";
?>
