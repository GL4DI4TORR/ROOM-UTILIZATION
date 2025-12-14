<?php
session_start();
require_once 'tools/functions.php';

echo "<h2>Current User Session Data</h2>";
echo "<pre>";
print_r($_SESSION['account']);
echo "</pre>";

echo "<h2>Permission Checks</h2>";
echo "hasPermission('admin'): " . (hasPermission('admin') ? 'true' : 'false') . "<br>";
echo "hasPermission('staff'): " . (hasPermission('staff') ? 'true' : 'false') . "<br>";
echo "hasPermission('both'): " . (hasPermission('both') ? 'true' : 'false') . "<br>";

if (isset($_SESSION['account'])) {
    echo "<h2>Raw Session Values</h2>";
    echo "is_admin: " . ($_SESSION['account']['is_admin'] ?? 'not set') . "<br>";
    echo "is_staff: " . ($_SESSION['account']['is_staff'] ?? 'not set') . "<br>";
}
?>
