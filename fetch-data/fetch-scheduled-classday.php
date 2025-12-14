<?php
    require_once '../classes/room-status.class.php'; // Include your class
    require_once '../tools/functions.php'; // Include functions for hasPermission
    session_start();

    // Add session validation and cache control headers
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Debug: Log session data for troubleshooting
    error_log("Session data for user: " . json_encode($_SESSION));
    error_log("Selected day: " . ($_POST['selected_day'] ?? 'not set'));

    // Debug permissions
    error_log("User permissions - Admin: " . (hasPermission('admin') ? 'true' : 'false'));
    error_log("User permissions - Staff: " . (hasPermission('staff') ? 'true' : 'false'));
    error_log("User permissions - Both: " . (hasPermission('both') ? 'true' : 'false'));

    $roomObj = new RoomStatus(); // Create an instance of your Room class

    $split_PK = $semester_PK = '';

    // Handle semester ID - set default if not exists
    if (isset($_SESSION['selected_semester_id']) && !empty($_SESSION['selected_semester_id'])) {
        $semester_PK = $_SESSION['selected_semester_id'];
        $split_PK = explode('|', $semester_PK);
        $roomObj->semester = $split_PK[0];
        $roomObj->school_year = $split_PK[1];
        error_log("Using semester: " . $roomObj->semester . ", year: " . $roomObj->school_year);
    } else {
        // Set default semester if not exists
        $roomObj->semester = '1';
        $roomObj->school_year = '2024-2025';
        $_SESSION['selected_semester_id'] = '1|2024-2025';
        error_log("Using default semester: " . $roomObj->semester . ", year: " . $roomObj->school_year);
    }
    
    // Get the selected day from the AJAX request
    $selected_day = isset($_POST['selected_day']) ? $_POST['selected_day'] : '';
    
    // Debug: Log the actual received data
    error_log("fetch-scheduled-classday.php - Received POST data: " . json_encode($_POST));
    error_log("fetch-scheduled-classday.php - Selected day: '$selected_day'");
    error_log("fetch-scheduled-classday.php - Session user: " . ($_SESSION['account']['username'] ?? 'unknown'));
    error_log("fetch-scheduled-classday.php - Session user role: " . ($_SESSION['account']['user_type'] ?? 'unknown'));
    
    // Convert empty string or space to null for showAllStatus method
    if ($selected_day === '' || $selected_day === ' ') {
        $selected_day = null;
        error_log("fetch-scheduled-classday.php - Converting empty/space to null");
    }
    
    // Fetch data based on the selected day
    $array = $roomObj->showAllStatus($selected_day);
    
    error_log("fetch-scheduled-classday.php - Results count: " . ($array ? count($array) : 0));
    
    if ($array) {
        error_log("fetch-scheduled-classday.php - First few records:");
        foreach (array_slice($array, 0, 3) as $i => $arr) {
            error_log("fetch-scheduled-classday.php - Record $i: " . $arr['subject_code'] . " on " . $arr['class_day']);
        }
    }

    // Check permissions once before the loop
    $hasAdminPerm = hasPermission('admin');
    $hasStaffPerm = hasPermission('staff');
    $showOccupy = $hasAdminPerm || $hasStaffPerm;

    if ($array) {
        foreach ($array as $i => $arr) {
            $actionButtons = "<td class='text-nowrap'>
                    <a href='' class='btn room-schedule'>Schedule</a>";
            
            if ($showOccupy) {
                $actionButtons .= "<a href='' class='btn room-status restricted' data-classid='{$arr['class_id']}' data-classday='{$arr['class_day']}' data-subjecttype='{$arr['subject_type']}'>Occupy</a>";
            }
            
            if ($hasAdminPerm) {
                $actionButtons .= "<a href='' class='btn admin edit-room-status' data-classid='{$arr['class_id']}' data-classday='{$arr['class_day']}' data-subjecttype='{$arr['subject_type']}'>Edit</a>
                        <a href='' class='btn admin display-status'>Display</a>
                        <a href='' class='btn admin delete delete-room-status' data-classid='{$arr['class_id']}' data-classday='{$arr['class_day']}' data-subjecttype='{$arr['subject_type']}'>X</a>";
            }
            
            $actionButtons .= "</td>";
            
            // Determine displayed remarks: if remarks is empty but this row is from class_schedule (occupied),
            // show the authoritative label 'Class scheduled'. Otherwise show whatever is in remarks.
            $rawRemarks = isset($arr['remarks']) ? trim($arr['remarks']) : '';
            $isScheduledRecord = (isset($arr['room_status']) && strtoupper($arr['room_status']) === 'OCCUPIED') || !empty($arr['class_id']);
            $displayRemarks = $rawRemarks !== '' ? $rawRemarks : ($isScheduledRecord ? 'Class scheduled' : '');

            echo "<tr>
                <td>" . ($i + 1) . "</td>
                <td>{$arr['room_name']}</td>
                <td>{$arr['room_type']}</td>
                <td>{$arr['subject_code']}</td>
                <td>{$arr['subject_type']}</td>
                <td>{$arr['section_name']}</td>
                <td>{$arr['start_time']}</td>
                <td>{$arr['end_time']}</td>
                <td>{$arr['faculty_name']}</td>
                <td>{$arr['room_status']}</td>
                <td>$displayRemarks</td>
                $actionButtons
            </tr>";
        }
    } else {
        echo "<tr><td colspan='11'>No data found for the selected day.</td></tr>";
    }
?>