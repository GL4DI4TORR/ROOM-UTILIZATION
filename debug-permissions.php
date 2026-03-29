<?php
session_start();

// Include the functions file
require_once 'tools/functions.php';

echo "<h2>Permission Debug Test</h2>";

// Check if user is logged in
if (!isset($_SESSION['account'])) {
    echo "<p>No user session found. Please login first.</p>";
} else {
    echo "<h3>Session Data:</h3>";
    echo "<pre>";
    print_r($_SESSION['account']);
    echo "</pre>";
    
    echo "<h3>Permission Checks:</h3>";
    echo "<p>hasPermission('admin'): " . (hasPermission('admin') ? 'true' : 'false') . "</p>";
    echo "<p>hasPermission('staff'): " . (hasPermission('staff') ? 'true' : 'false') . "</p>";
    echo "<p>hasPermission('both'): " . (hasPermission('both') ? 'true' : 'false') . "</p>";
    
    echo "<h3>Individual Checks:</h3>";
    echo "<p>is_admin value: " . ($_SESSION['account']['is_admin'] ?? 'not set') . "</p>";
    echo "<p>is_staff value: " . ($_SESSION['account']['is_staff'] ?? 'not set') . "</p>";
    
    echo "<h3>Occupy Button Should Show:</h3>";
    $shouldShow = hasPermission('admin') || hasPermission('staff');
    echo "<p>Result: " . ($shouldShow ? 'YES (admin/staff)' : 'NO (student/other)') . "</p>";
}
?>