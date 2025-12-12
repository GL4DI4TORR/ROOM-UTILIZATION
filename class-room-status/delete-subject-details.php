<?php
session_start();

require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

$roomObj = new RoomStatus();

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $subject_code = clean_input($_POST['subject-code'] ?? '');

    if(empty($subject_code)){
        echo json_encode(['status' => 'error', 'generalErr' => 'Subject code is required.']);
        exit;
    }

    try{
        $db = $roomObj->db->connect();
        $db->beginTransaction();

        // Remove dependent class_details first to avoid FK issues
        $deleteClassDetails = $db->prepare("DELETE FROM class_details WHERE subject_id = :subject_code");
        $deleteClassDetails->bindParam(':subject_code', $subject_code);
        $deleteClassDetails->execute();

        $deleteSubject = $db->prepare("DELETE FROM subject_details WHERE subject_code = :subject_code");
        $deleteSubject->bindParam(':subject_code', $subject_code);
        
        if($deleteSubject->execute()){
            $db->commit();
            echo json_encode(['status' => 'success']);
        } else {
            $db->rollBack();
            echo json_encode(['status' => 'error', 'generalErr' => 'Failed to delete subject.']);
        }
    } catch(Exception $e){
        if(isset($db) && $db->inTransaction()){
            $db->rollBack();
        }
        echo json_encode(['status' => 'error', 'generalErr' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

echo json_encode(['status' => 'error', 'generalErr' => 'Invalid request method.']);

