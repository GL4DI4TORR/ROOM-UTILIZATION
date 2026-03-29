<?php
    require_once('../classes/room-status.class.php');

    $roomObj = new RoomStatus();

    $classes = $roomObj->fetchclassesOption();
    
    // Debug logging
    error_log("fetch-classes.php: fetchclassesOption returned: " . print_r($classes, true));

    header('Content-Type: application/json');
    echo json_encode($classes);

?>
