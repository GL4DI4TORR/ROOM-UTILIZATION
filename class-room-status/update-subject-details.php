<?php
session_start();

require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

$roomObj = new RoomStatus();

$subject_code = $description = $lab_units = $lec_units = '';
$generalErr = $subject_codeErr = $descriptionErr = $lab_unitsErr = $lec_unitsErr = '';

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $original_subject_code = clean_input($_POST['original-subject-code'] ?? '');
    $subject_code = clean_input($_POST['subject-code'] ?? '');
    $description = clean_input($_POST['description'] ?? '');
    $lab_units = clean_input($_POST['lab-units'] ?? '');
    $lec_units = clean_input($_POST['lec-units'] ?? '');

    if(empty($original_subject_code)){
        $generalErr = 'Missing original subject code.';
    }

    if(empty($subject_code)){
        $subject_codeErr = 'Subject code is required.';
    }

    if(empty($description)){
        $descriptionErr = 'Description is required.';
    }

    if($lab_units === '' && $lab_units !== 0){
        $lab_unitsErr = 'Lab units is required.';
    } elseif(!is_numeric($lab_units) || $lab_units < 0){
        $lab_unitsErr = 'Lab units must be a valid number.';
    }

    if($lec_units === '' && $lec_units !== 0){
        $lec_unitsErr = 'Lec units is required.';
    } elseif(!is_numeric($lec_units) || $lec_units < 0){
        $lec_unitsErr = 'Lec units must be a valid number.';
    }

    // If subject code changed, ensure uniqueness
    if(empty($subject_codeErr) && $subject_code !== $original_subject_code){
        $existing = $roomObj->checkSubjectExists($subject_code);
        if($existing){
            $subject_codeErr = 'Subject code already exists.';
        }
    }

    if(!empty($generalErr) || !empty($subject_codeErr) || !empty($descriptionErr) || !empty($lab_unitsErr) || !empty($lec_unitsErr)){
        echo json_encode([
            'status' => 'error',
            'generalErr' => $generalErr,
            'subject_codeErr' => $subject_codeErr,
            'descriptionErr' => $descriptionErr,
            'lab_unitsErr' => $lab_unitsErr,
            'lec_unitsErr' => $lec_unitsErr
        ]);
        exit;
    }

    $total_units = $lab_units + $lec_units;

    try {
        $db = $roomObj->db->connect();
        $db->beginTransaction();

        // Update subject_details
        $sql = "UPDATE subject_details 
                SET subject_code = :subject_code, description = :description, total_units = :total_units, lec_units = :lec_units, lab_units = :lab_units
                WHERE subject_code = :original_subject_code";
        $query = $db->prepare($sql);
        $query->bindParam(':subject_code', $subject_code);
        $query->bindParam(':description', $description);
        $query->bindParam(':total_units', $total_units);
        $query->bindParam(':lec_units', $lec_units);
        $query->bindParam(':lab_units', $lab_units);
        $query->bindParam(':original_subject_code', $original_subject_code);
        $query->execute();

        // Update any class_details that reference this subject code
        $sqlUpdateClasses = "UPDATE class_details SET subject_id = :subject_code WHERE subject_id = :original_subject_code";
        $queryClasses = $db->prepare($sqlUpdateClasses);
        $queryClasses->bindParam(':subject_code', $subject_code);
        $queryClasses->bindParam(':original_subject_code', $original_subject_code);
        $queryClasses->execute();

        $db->commit();
        echo json_encode(['status' => 'success']);
    } catch(Exception $e){
        if($db && $db->inTransaction()){
            $db->rollBack();
        }
        echo json_encode(['status' => 'error', 'generalErr' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

echo json_encode(['status' => 'error', 'generalErr' => 'Invalid request method.']);

