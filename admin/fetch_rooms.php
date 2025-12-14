<?php
require_once('../classes/room-status.class.php');

$roomObj = new RoomStatus();

// Fetch all rooms (code and number)
$pdo = $roomObj->db->connect();
$stmt = $pdo->prepare("SELECT room_code, room_no, room_name FROM room_list");
$stmt->execute();
$rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($rooms);
