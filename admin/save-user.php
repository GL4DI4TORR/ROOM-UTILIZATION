<?php
require_once '../tools/functions.php';
require_once '../classes/account.class.php';

header('Content-Type: application/json');

$response = [
    'status' => 'error',
    'generalErr' => '',
    'user_idErr' => '',
    'usernameErr' => ''
];

$user_id = isset($_POST['user-id']) ? clean_input($_POST['user-id']) : '';
$username = isset($_POST['username']) ? clean_input($_POST['username']) : '';
$is_admin = isset($_POST['is-admin']) ? (int)$_POST['is-admin'] : 0;
$is_staff = isset($_POST['is-staff']) ? (int)$_POST['is-staff'] : 0;

if ($user_id === '') { $response['user_idErr'] = 'Student ID is required.'; }
if ($username === '') { $response['usernameErr'] = 'Username is required.'; }

if ($response['user_idErr'] === '' && $response['usernameErr'] === ''){
    try {
        $acc = new Account();
        if ($acc->userExist($user_id) === false){
            $response['generalErr'] = 'Student ID already registered.';
        } else {
            if ($acc->addToUserList($user_id, $username, $is_admin, $is_staff)){
                echo json_encode(['status' => 'success']);
                exit;
            }
            $response['generalErr'] = 'Failed to register Student ID.';
        }
    } catch (Exception $e){
        $response['generalErr'] = 'Server error.';
    }
}

echo json_encode($response);
exit;



