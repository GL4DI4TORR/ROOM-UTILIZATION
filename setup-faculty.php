<?php
require_once('classes/database.class.php');

$db = new Database();

// Insert faculty data if it doesn't exist
$sql = "INSERT IGNORE INTO faculty_list (faculty_id, user_id) VALUES 
(1, '201201234'),
(2, '201201235'),
(3, '201201236'),
(4, '201201237'),
(5, '201201238'),
(6, '201201239'),
(7, '201201240'),
(8, '201201241'),
(9, '201201242'),
(10, '201201243')";

$query = $db->connect()->prepare($sql);

if ($query->execute()) {
    echo "<h2>Faculty data inserted successfully!</h2>";
    
    // Verify the data was inserted
    $sql2 = "SELECT faculty_id, user_id FROM faculty_list ORDER BY faculty_id";
    $query2 = $db->connect()->prepare($sql2);
    
    if ($query2->execute()) {
        $faculty = $query2->fetchAll(PDO::FETCH_ASSOC);
        echo "<h3>Current faculty_list contents:</h3>";
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr style='background-color: #f0f0f0;'><th>faculty_id</th><th>user_id</th></tr>";
        
        foreach ($faculty as $f) {
            echo "<tr><td style='padding: 5px;'>{$f['faculty_id']}</td><td style='padding: 5px;'>{$f['user_id']}</td></tr>";
        }
        echo "</table>";
        
        echo "<h3>Now you can use these faculty_id values in your dropdown:</h3>";
        echo "<ul>";
        foreach ($faculty as $f) {
            echo "<li>Teacher {$f['faculty_id']} (faculty_id = {$f['faculty_id']})</li>";
        }
        echo "</ul>";
        
        echo "<p><strong>The dropdown should now work with faculty_id values 1-10!</strong></p>";
    }
} else {
    echo "Error inserting faculty data: " . print_r($query->errorInfo(), true);
}
?>
