<?php
session_start();

require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

$roomObj = new RoomStatus();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $subjectCode = isset($_GET['subjectCode']) ? clean_input($_GET['subjectCode']) : '';

    if (empty($subjectCode)) {
        echo json_encode(['status' => 'error', 'generalErr' => 'Subject code is required.']);
        exit;
    }

    $sql = "SELECT subject_code, description, lab_units, lec_units FROM subject_details WHERE subject_code = :subject_code LIMIT 1";
    $query = $roomObj->db->connect()->prepare($sql);
    $query->bindParam(':subject_code', $subjectCode);

    if ($query->execute()) {
        $data = $query->fetch(PDO::FETCH_ASSOC);
        if ($data) {
            echo json_encode($data);
        } else {
            echo json_encode(['status' => 'error', 'generalErr' => 'Subject not found.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'generalErr' => 'Failed to fetch subject.']);
    }
    exit;
}

echo json_encode(['status' => 'error', 'generalErr' => 'Invalid request method.']);

