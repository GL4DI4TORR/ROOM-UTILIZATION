<?php
session_start();

// Simulate login as student1 to check permissions
require_once 'classes/account.class.php';
require_once 'tools/functions.php';

echo "<h2>Student Permission Check</h2>";

// Check if user is logged in
if (!isset($_SESSION['account'])) {
    echo "<p>No user logged in. Testing with student1 account...</p>";
    
    // Create account instance and fetch student1 data
    $account = new Account();
    $studentData = $account->fetch('qb202101234'); // student1's username
    
    echo "<h3>Raw Student Data from Database:</h3>";
    echo "<pre>";
    print_r($studentData);
    echo "</pre>";
    
    if ($studentData) {
        // Simulate session data
        $_SESSION['account'] = $studentData;
        
        echo "<h3>Session Data (simulated):</h3>";
        echo "<pre>";
        print_r($_SESSION['account']);
        echo "</pre>";
        
        echo "<h3>Permission Checks:</h3>";
        echo "<p>hasPermission('admin'): " . (hasPermission('admin') ? 'true' : 'false') . "</p>";
        echo "<p>hasPermission('staff'): " . (hasPermission('staff') ? 'true' : 'false') . "</p>";
        echo "<p>hasPermission('both'): " . (hasPermission('both') ? 'true' : 'false') . "</p>";
        
        echo "<h3>Individual Field Checks:</h3>";
        echo "<p>is_admin: " . ($_SESSION['account']['is_admin'] ?? 'NULL') . "</p>";
        echo "<p>is_staff: " . ($_SESSION['account']['is_staff'] ?? 'NULL') . "</p>";
        echo "<p>is_admin == 1: " . (($_SESSION['account']['is_admin'] ?? null) == 1 ? 'true' : 'false') . "</p>";
        echo "<p>is_staff == 1: " . (($_SESSION['account']['is_staff'] ?? null) == 1 ? 'true' : 'false') . "</p>";
        
        echo "<h3>Occupy Button Should Show:</h3>";
        $shouldShow = hasPermission('admin') || hasPermission('staff');
        echo "<p>Result: " . ($shouldShow ? 'YES (admin/staff)' : 'NO (student/other)') . "</p>";
    } else {
        echo "<p>Student data not found!</p>";
    }
} else {
    echo "<p>User already logged in. Current session data:</p>";
    echo "<pre>";
    print_r($_SESSION['account']);
    echo "</pre>";
    
    echo "<h3>Permission Checks:</h3>";
    echo "<p>hasPermission('admin'): " . (hasPermission('admin') ? 'true' : 'false') . "</p>";
    echo "<p>hasPermission('staff'): " . (hasPermission('staff') ? 'true' : 'false') . "</p>";
    echo "<p>hasPermission('both'): " . (hasPermission('both') ? 'true' : 'false') . "</p>";
}
?>
