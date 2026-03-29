<?php
    require_once('../classes/room-status.class.php');

    $roomObj = new RoomStatus();

    $teacher = $roomObj->fetchteacherOption();
    
    // Debug: Log what we're getting
    error_log("Teacher data: " . print_r($teacher, true));

    header('Content-Type: application/json');
    echo json_encode($teacher);

?>
