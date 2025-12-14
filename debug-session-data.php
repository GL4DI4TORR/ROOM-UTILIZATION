<?php
session_start();
require_once 'tools/functions.php';

// Check if user is logged in
if (!isset($_SESSION['account'])) {
    echo "No user logged in. Please login first.";
    exit;
}

echo "<h2>Current Session Data</h2>";
echo "<pre>";
var_dump($_SESSION['account']);
echo "</pre>";

echo "<h2>Permission Function Tests</h2>";
echo "hasPermission('admin'): " . (hasPermission('admin') ? 'TRUE' : 'FALSE') . "<br>";
echo "hasPermission('staff'): " . (hasPermission('staff') ? 'TRUE' : 'FALSE') . "<br>";
echo "hasPermission('both'): " . (hasPermission('both') ? 'TRUE' : 'FALSE') . "<br>";

echo "<h2>Direct Session Values Check</h2>";
if (isset($_SESSION['account'])) {
    $account = $_SESSION['account'];
    echo "is_admin exists: " . (isset($account['is_admin']) ? 'YES' : 'NO') . "<br>";
    echo "is_staff exists: " . (isset($account['is_staff']) ? 'YES' : 'NO') . "<br>";
    
    if (isset($account['is_admin'])) {
        echo "is_admin value: " . $account['is_admin'] . " (type: " . gettype($account['is_admin']) . ")<br>";
    }
    if (isset($account['is_staff'])) {
        echo "is_staff value: " . $account['is_staff'] . " (type: " . gettype($account['is_staff']) . ")<br>";
    }
    
    // Test the actual conditions
    $isAdmin = isset($account['is_admin']) && $account['is_admin'] == 1;
    $isStaff = isset($account['is_staff']) && $account['is_staff'] == 1;
    echo "isAdmin condition: " . ($isAdmin ? 'TRUE' : 'FALSE') . "<br>";
    echo "isStaff condition: " . ($isStaff ? 'TRUE' : 'FALSE') . "<br>";
    echo "admin OR staff condition: " . (($isAdmin || $isStaff) ? 'TRUE' : 'FALSE') . "<br>";
}
?>
