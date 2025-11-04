<?php
require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

$roomObj = new RoomStatus();
$semester_PK = $_SESSION['selected_semester_id'];
$split_PK = explode('|', $semester_PK);
$semester = $split_PK[0];
$school_year = $split_PK[1];

// Assuming you want to get all classes for the selected semester
$classDetails = $roomObj->getClassDetailsBySemester($semester, $school_year);

if ($classDetails) {
    foreach ($classDetails as $class) {
        echo "Class ID: " . htmlspecialchars($class['class_id']) . "<br>";
        echo "Subject: " . htmlspecialchars($class['subject_id']) . "<br>";
        echo "Section: " . htmlspecialchars($class['section_']) . "<br>";
        echo "Teacher: " . htmlspecialchars($class['teacher_assigned']) . "<br>";
        echo "Subject Type: " . htmlspecialchars($class['subject_type']) . "<br>";
        echo "<hr>";
    }
} else {
    echo "No class details found.";
}

