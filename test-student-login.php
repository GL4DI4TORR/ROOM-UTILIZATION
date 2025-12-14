<?php
// Test script to verify student login functionality
session_start();

require_once 'tools/functions.php';
require_once 'classes/account.class.php';

// Test the hasPermission function
echo "<h2>Testing hasPermission function:</h2>";

// Test 1: No session (should return false for all)
echo "Test 1 - No session:<br>";
echo "hasPermission('admin'): " . (hasPermission('admin') ? 'true' : 'false') . "<br>";
echo "hasPermission('staff'): " . (hasPermission('staff') ? 'true' : 'false') . "<br>";
echo "hasPermission('both'): " . (hasPermission('both') ? 'true' : 'false') . "<br><br>";

// Test 2: Simulate student session
$_SESSION['account'] = [
    'account_id' => 'test_student',
    'username' => 'student1',
    'is_admin' => 0,
    'is_staff' => 0
];

echo "Test 2 - Student session (is_admin=0, is_staff=0):<br>";
echo "hasPermission('admin'): " . (hasPermission('admin') ? 'true' : 'false') . "<br>";
echo "hasPermission('staff'): " . (hasPermission('staff') ? 'true' : 'false') . "<br>";
echo "hasPermission('both'): " . (hasPermission('both') ? 'true' : 'false') . "<br><br>";

// Test 3: Simulate staff session
$_SESSION['account'] = [
    'account_id' => 'test_staff',
    'username' => 'staff1',
    'is_admin' => 0,
    'is_staff' => 1
];

echo "Test 3 - Staff session (is_admin=0, is_staff=1):<br>";
echo "hasPermission('admin'): " . (hasPermission('admin') ? 'true' : 'false') . "<br>";
echo "hasPermission('staff'): " . (hasPermission('staff') ? 'true' : 'false') . "<br>";
echo "hasPermission('both'): " . (hasPermission('both') ? 'true' : 'false') . "<br><br>";

// Test 4: Simulate admin session
$_SESSION['account'] = [
    'account_id' => 'test_admin',
    'username' => 'admin1',
    'is_admin' => 1,
    'is_staff' => 0
];

echo "Test 4 - Admin session (is_admin=1, is_staff=0):<br>";
echo "hasPermission('admin'): " . (hasPermission('admin') ? 'true' : 'false') . "<br>";
echo "hasPermission('staff'): " . (hasPermission('staff') ? 'true' : 'false') . "<br>";
echo "hasPermission('both'): " . (hasPermission('both') ? 'true' : 'false') . "<br><br>";

echo "<h2>Test completed!</h2>";
echo "<p>Students should see 'false' for all permissions and can only view the CLASS STATUS LIST section.</p>";
echo "<p>Staff/Admin should see 'true' for appropriate permissions and can see all sections.</p>";

// Clear session
session_destroy();
?>
