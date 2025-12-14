<?php
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once('../tools/functions.php');
require_once('../classes/room-status.class.php');

// Set content type header
header('Content-Type: application/json');

// Debug log to confirm this script is being called
error_log("update-class-detail.php script accessed at " . date('Y-m-d H:i:s'));

try {


$original_class_id = $original_subject_id = $original_subject_type = $original_section_id = '';
$original_course_abbr = $original_year_level = $original_section = '';

//this var refers to the name of the section, room, subject, and teacher selected in the input field
$selected_section = $selected_subject = $selected_teacher = '';

//this var refers to the id of the section, room, subject, and teacher selected in the dropdown list
$class_id = $section_id = $subject_id = $subject_type = $teacher_assigned = '';
$generalErr = $class_idErr = $section_idErr = $subject_idErr = $subject_typeErr = $teacher_assignedErr = '';

$roomObj = new RoomStatus();

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    error_log("POST data received: " . print_r($_POST, true));
    error_log("Session data: " . print_r($_SESSION, true));
    
    $original_class_id = isset($_POST['original-class-id']) ? clean_input($_POST['original-class-id']) : '';
    $original_subject_id = isset($_POST['original-subject-id']) ? clean_input($_POST['original-subject-id']) : '';
    $original_subject_type = isset($_POST['original-subtype-id']) ? clean_input($_POST['original-subtype-id']) : '';

    
    if(!empty($_POST['original-section-id'])){
        $original_section_id = clean_input($_POST['original-section-id']);
        $split_original_sectionID = explode('|', $original_section_id);
        $original_course_abbr = $split_original_sectionID[0];
        $original_year_level = $split_original_sectionID[1];
        $original_section = $split_original_sectionID[2];
    }
    
    error_log("Original Selected Id: classid=$original_class_id, subjectid=$original_subject_id, sectionid=$original_section_id, teacher=$selected_teacher");

    $selected_subject = isset($_POST['subject']) ? clean_input($_POST['subject']) : '';
    $selected_section = isset($_POST['section']) ? clean_input($_POST['section']) : '';
    $selected_teacher = isset($_POST['teacher']) ? clean_input($_POST['teacher']) : '';

    $selected_subject = explode(' ', $selected_subject)[0];

    error_log("Selected values: section=$selected_section, subject=$selected_subject, teacher=$selected_teacher");
    
    $class_id = isset($_POST['class-id']) ? clean_input($_POST['class-id']) : '';
    
    $subject_id = isset($_POST['subject-id']) ? clean_input($_POST['subject-id']) : '';

    $times = 0;
    $unitDetails = null; // Initialize variable to prevent undefined warning
    
    if(empty($_POST['subject-type'])){
        $subject_typeErr = 'Subject Type is required.';
    }else{
        $subject_type = $_POST['subject-type'];
        $unitDetails = $roomObj->checkSubjectType($subject_id, $subject_type);
    }

    if($unitDetails != null){
        $generalErr = '<strong>SUBJECT TYPE INVALID!</strong> <br> This subject has ';
        if($subject_type == 'LAB'){
            $generalErr .= '0 lab units but has ' . $unitDetails['lec_units'] . ' lec units registered on the subject.'; 
            $subject_typeErr = 'Uncheck subject type LEC and check subject type <strong>LAB</strong> instead';
        }else if ($subject_type == 'LEC'){
            $generalErr .= '0 lec units but has ' . $unitDetails['lab_units'] . ' lab units registered on the subject.';
            $subject_typeErr = 'Uncheck subject type LAB and check subject type <strong>LEC</strong> instead';
        }
        
        
        echo json_encode([
            'status' => 'error',
            'generalErr' => $generalErr,
            'subject_typeErr' => $subject_typeErr
        ]);
        exit;
    }

    $section_id = isset($_POST['section-id']) ? clean_input($_POST['section-id']) : '';
   
    if(!empty($selected_section) && empty($section_id)){
        $section_idErr = 'Select a section from the dropdown.';
    }else if(empty($selected_section)){
        $section_idErr = 'Section is required.';
    }else{//split section id from CS|1|A to the variables
        $split_sectionID = explode('|', $section_id);
        $course_abbr = $split_sectionID[0];
        $year_level = $split_sectionID[1];
        $section = $split_sectionID[2];
    }


    $teacher_assigned = isset($_POST['teacher-assigned']) ? clean_input($_POST['teacher-assigned']) : '';

    error_log("ID values: class_id=$class_id, section_id=$section_id,  subject_id=$subject_id, teacher_assigned=$teacher_assigned");
    
    if(empty($class_id)){
        $class_idErr = 'Class ID is required.';
    }else if(!preg_match('/^[A-Z]+\d{3}$/', $class_id)){
        $class_idErr = 'Class ID must be uppercase letters followed by 3 digits (e.g., CALC138).';
    }

    if(!empty($selected_subject) && empty($subject_id)){
        $subject_idErr = 'Select a subject from the dropdown.';
    } else if(empty($selected_subject)){
        $subject_idErr = 'Subject is required.';
    }

  

    if(!empty($selected_teacher) && empty($teacher_assigned)){
        $teacher_assignedErr = 'Select a teacher from the dropdown.';
    } else if(empty($selected_teacher)){
        $teacher_assignedErr = 'Teacher is required.';
    }



    if(!empty($class_idErr) || !empty($subject_idErr) || !empty($subject_typeErr) || !empty($section_idErr) || !empty($teacher_assignedErr)){
        echo json_encode([
            'status' => 'error',
            'class_idErr' => $class_idErr,
            'subject_idErr' => $subject_idErr,
            'subject_typeErr' => $subject_typeErr,
            'section_idErr' => $section_idErr,
            'teacher_assignedErr' => $teacher_assignedErr
        ]);
        exit;
    }
    $roomObj->subject_code = $selected_subject;
    $roomObj->original_subject_id = $original_subject_id;
    
    $roomObj->original_class_id = $original_class_id;
    $roomObj->original_subject_type = $original_subject_type;
    // $roomObj->class_id = $class_id;
    // $roomObj->subject_id = $subject_id;
    // $roomObj->section_id = $section_id;
    // $roomObj->teacher_assigned = $teacher_assigned;
    // $roomObj->room_id = $room_id;


    $roomObj->class_id = $class_id;
    $roomObj->subject_type = $subject_type;
    $roomObj->subject_id = $subject_id;
    
    $roomObj->course_abbr = $course_abbr;
    $roomObj->year_level = $year_level;
    $roomObj->section = $section;
    
    $roomObj->teacher_assigned = $teacher_assigned;

    $existing_details = $roomObj->checkExistingClassDetailsPK($class_id, $original_class_id);
    //if data is received and not null, therefore an existing class detail exist
    if($existing_details != null){
        $generalErr = '<strong>EXISTING CLASS ID!</strong> <br> A class with class ID ' . $existing_details['class_id'] . ' already exists for section ' . $existing_details['section_'] . ' with subject ' . $existing_details['subject_'];
        $class_idErr = 'Class ID should be unique for each section class.';
        echo json_encode([
            'status' => 'error',
            'generalErr' => $generalErr,
            'class_idErr' => $class_idErr
        ]);
        exit;
    }

    $existing_class = $roomObj->checkSubjectSectionExisting($original_class_id);
    if($existing_class != null){
        $generalErr = '<strong>EXISTING DATA!</strong> <br> This subject already exists for this section with class ID ' . $existing_class;
        $subject_idErr = 'Cannot update a subject that exist for this section.';
    
        echo json_encode([
            'status' => 'error',
            'generalErr' => $generalErr,
            'subject_idErr' => $subject_idErr
        ]);
        exit;
    }

    //check condition for class id, if false then same class id can be added
    $match_classDetails = $roomObj->checkConditionClassDetailPK();
    if($match_classDetails == null){

        $existing_classID = $roomObj->checkClassIDExisting($class_id);
        //if true, existing class_id,

        if($existing_classID != null){
            $generalErr = '<strong>EXISTING CLASS ID!</strong> <br>This class ID already exist for section ' . $existing_classID . ' with a subject';
            $class_idErr = 'Class ID should be unique for each section class.';
        
            echo json_encode([
                'status' => 'error',
                'generalErr' => $generalErr,
                'class_idErr' => $class_idErr
            ]);
            exit;
        }

    }

    if($match_classDetails != null){    
        if($class_id != $match_classDetails['class_id']){
            $generalErr = '<strong>MATCHED CLASS ID!</strong> <br>This class matched with <strong>' . $match_classDetails['class_id'] . '</strong> with subject ' . $match_classDetails['subject_id'] . ' for section ' . $match_classDetails['section_name'];
            $class_idErr = 'Class ID should match with the same subject for this section.';
        
            echo json_encode([
                'status' => 'error',
                'generalErr' => $generalErr,
                'class_idErr' => $class_idErr
            ]);
            exit;
        }
    }

    

    if($roomObj->updateClassDetails()){
        // Fetch authoritative updated record for the UI
        $sql = "SELECT \
                    class.class_id AS class_id,\n+                    class.subject_type AS subject_type,\n+                    class.subject_id AS subject_code,\n+                    sub.description AS subject_description,\n+                    CONCAT(class.course_abbr, class.year_level, class.section) AS section_name,\n+                    CONCAT(acc.last_name,', ',acc.first_name) AS teacher_name,\n+                    class.teacher_assigned AS teacher_id\n+                FROM class_details class\n+                LEFT JOIN subject_details sub ON class.subject_id = sub.subject_code\n+                LEFT JOIN faculty_list fac ON class.teacher_assigned = fac.faculty_id\n+                LEFT JOIN user_list user ON fac.user_id = user.user_id\n+                LEFT JOIN account acc ON user.user_id = acc.account_id\n+                WHERE class.class_id = :class_id AND class.subject_type = :subject_type LIMIT 1;";
        $query = $roomObj->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $roomObj->class_id);
        $query->bindParam(':subject_type', $roomObj->subject_type);
        $updated = null;
        if ($query->execute()) {
            $updated = $query->fetch(PDO::FETCH_ASSOC);
        }

        echo json_encode(['status' => 'success', 'data' => $updated]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Something went wrong when updating the class details.']);
    }
    exit;

} // End of POST block and try block

} catch (Exception $e) {
    error_log("Exception in update-class-detail.php: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

?>
