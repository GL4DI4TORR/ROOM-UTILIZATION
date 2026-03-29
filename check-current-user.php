<?php
session_start();
require_once 'tools/functions.php';

echo "<h2>Current User Check</h2>";

if (!isset($_SESSION['account'])) {
    echo "<p>No user is currently logged in.</p>";
    echo "<p>Please login and then refresh this page.</p>";
} else {
    echo "<h3>Current Session Data:</h3>";
    echo "<pre>";
    print_r($_SESSION['account']);
    echo "</pre>";
    
    echo "<h3>Permission Checks:</h3>";
    echo "<p>hasPermission('admin'): " . (hasPermission('admin') ? 'true' : 'false') . "</p>";
    echo "<p>hasPermission('staff'): " . (hasPermission('staff') ? 'true' : 'false') . "</p>";
    echo "<p>hasPermission('both'): " . (hasPermission('both') ? 'true' : 'false') . "</p>";
    
    echo "<h3>Occupy Button Status:</h3>";
    $shouldShow = hasPermission('admin') || hasPermission('staff');
    echo "<p>Occupy button should be: " . ($shouldShow ? 'VISIBLE' : 'HIDDEN') . "</p>";
    
    if ($shouldShow) {
        echo "<p style='color: red; font-weight: bold;'>WARNING: This user can see the Occupy button!</p>";
    } else {
        echo "<p style='color: green; font-weight: bold;'>GOOD: This user cannot see the Occupy button.</p>";
    }
    
    echo "<h3>Account Details:</h3>";
    echo "<p>Username: " . ($_SESSION['account']['username'] ?? 'not set') . "</p>";
    echo "<p>Account ID: " . ($_SESSION['account']['account_id'] ?? 'not set') . "</p>";
    echo "<p>is_admin: " . ($_SESSION['account']['is_admin'] ?? 'NULL') . "</p>";
    echo "<p>is_staff: " . ($_SESSION['account']['is_staff'] ?? 'NULL') . "</p>";
}

echo "<br><p><a href='account/logout.php'>Logout</a> | <a href='class-room-status/viewclass-status.php'>Go to Class Status</a></p>";
?>
