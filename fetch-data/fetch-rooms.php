<?php
require_once '../classes/room-status.class.php';

$roomObj = new RoomStatus();
$rooms = $roomObj->fetchRoomOption();

header('Content-Type: application/json');
echo json_encode($rooms);
?>
