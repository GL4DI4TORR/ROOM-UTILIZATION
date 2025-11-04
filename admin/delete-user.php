<?php
require_once '../tools/functions.php';
require_once '../classes/account.class.php';

header('Content-Type: application/json');

$user_id = isset($_POST['user-id']) ? clean_input($_POST['user-id']) : '';
if ($user_id === ''){ echo json_encode(['status' => 'error', 'generalErr' => 'Missing user id.']); exit; }

try{
    $acc = new Account();
    if ($acc->deleteFromUserList($user_id)){
        echo json_encode(['status' => 'success']);
        exit;
    }
    echo json_encode(['status' => 'error', 'generalErr' => 'Delete failed.']);
} catch (Exception $e){
    echo json_encode(['status' => 'error', 'generalErr' => 'Server error.']);
}
exit;



