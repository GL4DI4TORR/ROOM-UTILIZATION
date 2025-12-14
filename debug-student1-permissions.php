<?php
require_once 'classes/database.class.php';

$db = new Database();
$connection = $db->connect();

echo "<h2>Student1 Permission Debug</h2>";

// Check student1 in account table
echo "<h3>Account Table Entry for student1:</h3>";
$stmt = $connection->prepare("SELECT * FROM account WHERE username = 'qb202101234' OR account_id = '202101234'");
$stmt->execute();
$account = $stmt->fetch(PDO::FETCH_ASSOC);
echo "<pre>";
print_r($account);
echo "</pre>";

// Check if student1 exists in user_list table
echo "<h3>User List Table Entry for student1:</h3>";
$stmt = $connection->prepare("SELECT * FROM user_list WHERE user_id = '202101234' OR username = 'qb202101234'");
$stmt->execute();
$userList = $stmt->fetch(PDO::FETCH_ASSOC);
echo "<pre>";
print_r($userList);
echo "</pre>";

// Test the exact query used in fetch() method
echo "<h3>Testing fetch() method query:</h3>";
$stmt = $connection->prepare("SELECT * FROM account acc LEFT JOIN user_list list ON acc.account_id = list.user_id WHERE acc.username = 'qb202101234' LIMIT 1");
$stmt->execute();
$fetchResult = $stmt->fetch(PDO::FETCH_ASSOC);
echo "<pre>";
print_r($fetchResult);
echo "</pre>";

if ($fetchResult) {
    echo "<h3>Permission Analysis:</h3>";
    echo "<p>is_admin value: " . ($fetchResult['is_admin'] ?? 'NULL') . "</p>";
    echo "<p>is_staff value: " . ($fetchResult['is_staff'] ?? 'NULL') . "</p>";
    echo "<p>is_admin == 1: " . (($fetchResult['is_admin'] ?? null) == 1 ? 'true' : 'false') . "</p>";
    echo "<p>is_staff == 1: " . (($fetchResult['is_staff'] ?? null) == 1 ? 'true' : 'false') . "</p>";
    echo "<p>isset(is_admin): " . (isset($fetchResult['is_admin']) ? 'true' : 'false') . "</p>";
    echo "<p>isset(is_staff): " . (isset($fetchResult['is_staff']) ? 'true' : 'false') . "</p>";
    
    // Simulate hasPermission function
    $isAdmin = isset($fetchResult['is_admin']) && $fetchResult['is_admin'] == 1;
    $isStaff = isset($fetchResult['is_staff']) && $fetchResult['is_staff'] == 1;
    $hasBoth = $isAdmin || $isStaff;
    
    echo "<h3>Permission Function Results:</h3>";
    echo "<p>hasPermission('admin'): " . ($isAdmin ? 'true' : 'false') . "</p>";
    echo "<p>hasPermission('staff'): " . ($isStaff ? 'true' : 'false') . "</p>";
    echo "<p>hasPermission('both'): " . ($hasBoth ? 'true' : 'false') . "</p>";
    echo "<p>Occupy button should show: " . ($hasBoth ? 'YES' : 'NO') . "</p>";
}

// Check all user_list entries to see if there are any unexpected admin accounts
echo "<h3>All User List Entries:</h3>";
$stmt = $connection->prepare("SELECT * FROM user_list");
$stmt->execute();
$allUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<pre>";
print_r($allUsers);
echo "</pre>";

?>
