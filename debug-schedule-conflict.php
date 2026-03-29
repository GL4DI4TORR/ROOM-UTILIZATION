<?php
require_once('classes/database.class.php');
require_once('classes/room-status.class.php');

$db = new Database();
$roomObj = new RoomStatus();

// Test the exact scenario: Tuesday/Friday 8:30-10:00 vs phantom 13:30-15:00
echo "<h2>Debug Schedule Conflict Detection</h2>";

// Check what's actually in class_schedule
echo "<h3>Current class_schedule table contents:</h3>";
$sql = "SELECT * FROM class_schedule ORDER BY day, start_time";
$query = $db->connect()->prepare($sql);
if ($query->execute()) {
    $schedules = $query->fetchAll(PDO::FETCH_ASSOC);
    if (empty($schedules)) {
        echo "<p><strong>NO DATA FOUND in class_schedule table</strong></p>";
    } else {
        echo "<table border='1'>";
        echo "<tr><th>class_id</th><th>subject_type</th><th>day</th><th>start_time</th><th>end_time</th><th>room_code</th><th>room_no</th></tr>";
        foreach ($schedules as $schedule) {
            echo "<tr>";
            echo "<td>{$schedule['class_id']}</td>";
            echo "<td>{$schedule['subject_type']}</td>";
            echo "<td>{$schedule['day']}</td>";
            echo "<td>{$schedule['start_time']}</td>";
            echo "<td>{$schedule['end_time']}</td>";
            echo "<td>{$schedule['room_code']}</td>";
            echo "<td>{$schedule['room_no']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
}

echo "<h3>Testing conflict detection methods:</h3>";

// Test the exact parameters that would be used
$roomObj->class_id = 'TEST123';
$roomObj->subject_type = 'LEC';
$roomObj->day_id = 'Tuesday';
$roomObj->start_time = '08:30:00';
$roomObj->end_time = '10:00:00';
$roomObj->room_code = 'LR';
$roomObj->room_no = '3';

echo "<h4>Testing checkClassDayAlreadyExist() for Tuesday:</h4>";
$result1 = $roomObj->checkClassDayAlreadyExist();
if ($result1) {
    echo "<p><strong>FOUND CONFLICT:</strong> " . implode(', ', $result1) . "</p>";
} else {
    echo "<p>No conflict found (NULL result)</p>";
}

echo "<h4>Testing checkExistingClassTime() for Tuesday:</h4>";
$result2 = $roomObj->checkExistingClassTime();
if ($result2) {
    echo "<p><strong>FOUND TIME CONFLICT:</strong> " . implode(', ', $result2) . "</p>";
} else {
    echo "<p>No time conflict found (NULL result)</p>";
}

// Test Friday
$roomObj->day_id = 'Friday';
echo "<h4>Testing checkClassDayAlreadyExist() for Friday:</h4>";
$result3 = $roomObj->checkClassDayAlreadyExist();
if ($result3) {
    echo "<p><strong>FOUND CONFLICT:</strong> " . implode(', ', $result3) . "</p>";
} else {
    echo "<p>No conflict found (NULL result)</p>";
}

echo "<h4>Testing checkExistingClassTime() for Friday:</h4>";
$result4 = $roomObj->checkExistingClassTime();
if ($result4) {
    echo "<p><strong>FOUND TIME CONFLICT:</strong> " . implode(', ', $result4) . "</p>";
} else {
    echo "<p>No time conflict found (NULL result)</p>";
}

echo "<h3>Raw SQL Query Test:</h3>";
echo "<h4>checkExistingClassTime SQL:</h4>";
$sql = "SELECT      
s.class_id AS class_id,
s.subject_type AS sub_type,
s.day AS day_name,
s.start_time AS start_time,
s.end_time AS end_time,
CONCAT(s.room_code, ' ', s.room_no) AS room
FROM class_schedule s
WHERE s.day = :day_id AND (
s.room_code = :room_code AND s.room_no = :room_no
) AND (
(s.start_time <= :end_time AND s.end_time >= :start_time)
OR (s.start_time >= :start_time AND s.start_time < :end_time)
OR (s.end_time > :start_time AND s.end_time <= :end_time)
)";

$query = $db->connect()->prepare($sql);
$query->bindParam(':day_id', $roomObj->day_id);
$query->bindParam(':room_code', $roomObj->room_code);
$query->bindParam(':room_no', $roomObj->room_no);
$query->bindParam(':start_time', $roomObj->start_time);
$query->bindParam(':end_time', $roomObj->end_time);

echo "<p><strong>Query executed with:</strong></p>";
echo "<ul>";
echo "<li>day_id: {$roomObj->day_id}</li>";
echo "<li>room_code: {$roomObj->room_code}</li>";
echo "<li>room_no: {$roomObj->room_no}</li>";
echo "<li>start_time: {$roomObj->start_time}</li>";
echo "<li>end_time: {$roomObj->end_time}</li>";
echo "</ul>";

if ($query->execute()) {
    $data = $query->fetchAll(PDO::FETCH_ASSOC);
    if (empty($data)) {
        echo "<p><strong>NO RESULTS from query</strong></p>";
    } else {
        echo "<p><strong>QUERY RESULTS:</strong></p>";
        echo "<table border='1'>";
        echo "<tr><th>class_id</th><th>sub_type</th><th>day_name</th><th>start_time</th><th>end_time</th><th>room</th></tr>";
        foreach ($data as $row) {
            echo "<tr>";
            echo "<td>{$row['class_id']}</td>";
            echo "<td>{$row['sub_type']}</td>";
            echo "<td>{$row['day_name']}</td>";
            echo "<td>{$row['start_time']}</td>";
            echo "<td>{$row['end_time']}</td>";
            echo "<td>{$row['room']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
} else {
    echo "<p><strong>QUERY ERROR:</strong></p>";
    print_r($query->errorInfo());
}
?>
