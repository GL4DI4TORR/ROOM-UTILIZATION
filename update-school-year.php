<?php
require_once('classes/database.class.php');

$db = new Database();

echo "<h2>Update school_year in class_schedule</h2>";

// Update all records from 2025-2026 to 2024-2025
$sql = "UPDATE class_schedule SET school_year = '2024-2025' WHERE school_year = '2025-2026'";
$query = $db->connect()->prepare($sql);

if ($query->execute()) {
    $affected = $query->rowCount();
    echo "<p><strong>Updated $affected records</strong></p>";
    
    // Verify the update
    $sql = "SELECT DISTINCT semester, school_year FROM class_schedule";
    $query = $db->connect()->prepare($sql);
    
    if ($query->execute()) {
        $data = $query->fetchAll(PDO::FETCH_ASSOC);
        echo "<h3>Updated semester/school_year values:</h3>";
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
    
    // Show updated data
    echo "<h3>Updated class_schedule data:</h3>";
    $sql = "SELECT * FROM class_schedule ORDER BY day, start_time";
    $query = $db->connect()->prepare($sql);
    
    if ($query->execute()) {
        $data = $query->fetchAll(PDO::FETCH_ASSOC);
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
} else {
    echo "<p><strong>Update failed:</strong></p>";
    print_r($query->errorInfo());
}
?>
