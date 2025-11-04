<?php
require_once '../tools/functions.php';
require_once '../classes/account.class.php';

header('Content-Type: application/json');

$response = [ 'status' => 'error', 'generalErr' => '' ];

$user_id = isset($_POST['user-id']) ? clean_input($_POST['user-id']) : '';
$username = isset($_POST['username']) ? clean_input($_POST['username']) : '';
$is_admin = isset($_POST['is-admin']) ? (int)$_POST['is-admin'] : 0;
$is_staff = isset($_POST['is-staff']) ? (int)$_POST['is-staff'] : 0;

if ($user_id === '' || $username === ''){
    $response['generalErr'] = 'Student ID and Username are required.';
    echo json_encode($response); exit;
}

try{
    $acc = new Account();
    if ($acc->updateUserList($user_id, $username, $is_admin, $is_staff)){
        // If an account already exists for this user_id, sync the account.username
        if ($acc->accountExistsById($user_id)){
            $acc->updateAccountUsername($user_id, $username);
        }
        echo json_encode(['status' => 'success']);
        exit;
    }
    $response['generalErr'] = 'Update failed.';
} catch (Exception $e){
    $response['generalErr'] = 'Server error.';
}

echo json_encode($response);
exit;


