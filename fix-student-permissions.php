<?php
require_once 'classes/database.class.php';

$db = new Database();
$connection = $db->connect();

echo "<h2>Fix Student Permissions</h2>";

// Check all account entries
echo "<h3>All Account Entries:</h3>";
$stmt = $connection->prepare("SELECT * FROM account");
$stmt->execute();
$accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<pre>";
print_r($accounts);
echo "</pre>";

// Find student1 in account table
echo "<h3>Find student1 in Account Table:</h3>";
foreach ($accounts as $account) {
    if (strpos($account['username'], 'student1') !== false || strpos($account['username'], 'qb202101234') !== false) {
        echo "<p>Found student1: account_id = {$account['account_id']}, username = {$account['username']}</p>";
        
        // Check if this account_id exists in user_list
        $stmt = $connection->prepare("SELECT * FROM user_list WHERE user_id = ?");
        $stmt->execute([$account['account_id']]);
        $userListEntry = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($userListEntry) {
            echo "<p>User list entry found for this account_id:</p>";
            echo "<pre>";
            print_r($userListEntry);
            echo "</pre>";
        } else {
            echo "<p>No user_list entry found for account_id {$account['account_id']}. Creating student entry...</p>";
            
            // Insert student entry with no privileges
            $stmt = $connection->prepare("INSERT INTO user_list (user_id, username, is_admin, is_staff) VALUES (?, ?, 0, 0)");
            $result = $stmt->execute([$account['account_id'], $account['username']]);
            
            if ($result) {
                echo "<p>Successfully created student entry for {$account['account_id']}</p>";
            } else {
                echo "<p>Failed to create student entry</p>";
            }
        }
    }
}

// Check for any mismatched entries
echo "<h3>Check for Mismatched Entries:</h3>";
$stmt = $connection->prepare("SELECT acc.*, list.* FROM account acc LEFT JOIN user_list list ON acc.account_id = list.user_id WHERE list.user_id IS NULL");
$stmt->execute();
$mismatched = $stmt->fetchAll(PDO::FETCH_ASSOC);

if ($mismatched) {
    echo "<p>Found accounts without user_list entries:</p>";
    echo "<pre>";
    print_r($mismatched);
    echo "</pre>";
    
    // Create student entries for all mismatched accounts
    foreach ($mismatched as $account) {
        echo "<p>Creating student entry for {$account['account_id']}...</p>";
        $stmt = $connection->prepare("INSERT INTO user_list (user_id, username, is_admin, is_staff) VALUES (?, ?, 0, 0)");
        $result = $stmt->execute([$account['account_id'], $account['username']]);
        echo "<p>Result: " . ($result ? 'Success' : 'Failed') . "</p>";
    }
} else {
    echo "<p>All accounts have corresponding user_list entries.</p>";
}

echo "<h3>Final Verification:</h3>";
$stmt = $connection->prepare("SELECT * FROM account acc LEFT JOIN user_list list ON acc.account_id = list.user_id WHERE acc.username LIKE '%student1%' OR acc.username = 'qb202101234'");
$stmt->execute();
$finalCheck = $stmt->fetch(PDO::FETCH_ASSOC);
echo "<pre>";
print_r($finalCheck);
echo "</pre>";

?>
