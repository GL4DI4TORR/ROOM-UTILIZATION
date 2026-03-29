<?php

require_once 'database.class.php';

class RoomStatus{
    public $last_error = '';

    public $semester = '';
    public $school_year = '';

    
    //PK ROOM 
    public $room_code = '';
    public $room_no = '';
    
    //room_list
    public $room_name = '';
    public $room_type = '';
    
    //subject_Details PK
    public $subject_code = '';
    
    
    public $class_name = '';
    public $status = '';
    
    // Properties for class details
    public $class_id = ''; // PK class_details
    public $subject_type = '';//PK

    public $subject_id = '';

    public $section_id = '';
    public $course_abbr = '';
    public $year_level = '';
    public $section = '';
    
    public $teacher_assigned = ''; 
    public $room_id = '';
    
    public $original_class_id = '';
    public $original_subject_type = '';
    public $original_class_day = '';
    public $original_subject_id = '';
    
    public $start_time = '';
    public $end_time = ''; 
    public $day_id = ''; //day name = 'Monday','Tuesday', etc
    
    public $class_status_id = '';
    
    // Properties for IDs and logs
    public $class_time_id = ''; // PK class_time
    public $class_day_id = '';
    public $log_cid = []; // Log for class IDs
    public $log_ctid = []; // Log for class time IDs
    public $log_cdid = []; // Log for class day IDs
    public $log_day = []; // Log for day IDs
    public $log_sid = []; // Log for day IDs
    public $week_day = '';
    public $id = '';
    
    public $db;
    
    function __construct(){
        $this->db = new Database();
    }
    
    
    //NEW QUERIES UPDATED
    function updateClassDetails(){
        $sql = "UPDATE class_details 
            SET class_id = :class_id,
                subject_type = :subject_type, 
                subject_id = :subject_id, 
                course_abbr = :course_abbr, 
                year_level = :year_level, 
                section = :section,
                teacher_assigned = :teacher_id
                
            WHERE class_id = :original_class_id AND subject_type = :original_subtype_id;";
            
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $this->class_id);
        $query->bindParam(':subject_type', $this->subject_type);
        $query->bindParam(':subject_id', $this->subject_id);

        $query->bindParam(':course_abbr', $this->course_abbr);
        $query->bindParam(':year_level', $this->year_level);
        $query->bindParam(':section', $this->section);

        $query->bindParam(':teacher_id', $this->teacher_assigned);
        $query->bindParam(':original_class_id', $this->original_class_id);
        $query->bindParam(':original_subtype_id', $this->original_subject_type);
        $query->execute();
        return true;
    }

    //UPDATE CLASS SCHEDULE
    function updateScheduleDay(){
        $sql = "UPDATE class_schedule
            SET class_id = :class_id,
                subject_type = :subject_type, 
                `day` = :day_id, 
                start_time = :start_time, 
                end_time = :end_time, 
                room_code = :room_code, 
                room_no = :room_no
            WHERE class_id = :originalClassID AND subject_type = :originalSubtype And `day` = :originalClassDay
        ;";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $this->class_id);
        $query->bindParam(':subject_type', $this->subject_type);
        $query->bindParam(':day_id', $this->day_id);
        $query->bindParam(':start_time', $this->start_time);
        $query->bindParam(':end_time', $this->end_time);
        $query->bindParam(':room_code', $this->room_code);
        $query->bindParam(':room_no', $this->room_no);
        $query->bindParam(':originalClassID', $this->original_class_id);
        $query->bindParam(':originalSubtype', $this->original_subject_type);
        $query->bindParam(':originalClassDay', $this->original_class_day);
        
        if ($query->execute()) {
            return true;
        } else {
            // Log error information
            error_log("Update failed: " . implode(", ", $query->errorInfo()));
            return false; // Update failed
        }
    }
 

    //UPDATED 
    function insertClassDetails(){
        try {
            $sql = "INSERT INTO class_details (class_id, subject_type, subject_id, course_abbr, year_level, section, teacher_assigned, semester, school_year) VALUES (:class_id, :subject_type, :subject_id, :course_abbr, :year_level, :section, :teacher_id, :semester, :school_year);";
            $query = $this->db->connect()->prepare($sql);
            $query->bindParam(':class_id', $this->class_id);
            $query->bindParam(':subject_type', $this->subject_type);
            $query->bindParam(':subject_id', $this->subject_id);
            $query->bindParam(':course_abbr', $this->course_abbr);
            $query->bindParam(':year_level', $this->year_level);
            $query->bindParam(':section', $this->section);
            $query->bindParam(':teacher_id', $this->teacher_assigned);
            $query->bindParam(':semester', $this->semester);
            $query->bindParam(':school_year', $this->school_year);
            $query->execute();
            return true;
        } catch (PDOException $e) {
            $this->last_error = $e->getMessage();
            return false;
        }
    }

    function insertScheduleDay(){
        $sql = "INSERT INTO class_schedule 
        (class_id, subject_type, `day`, start_time, end_time, room_code, room_no, status, remarks, semester, school_year) 
        VALUES (:class_id, :subject_type, :day_id, :start_time, :end_time, :room_code, :room_no, 'OCCUPIED', '', :semester, :school_year);";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $this->class_id);
        $query->bindParam(':subject_type', $this->subject_type);
        $query->bindParam(':day_id', $this->day_id);
        $query->bindParam(':start_time', $this->start_time);
        $query->bindParam(':end_time', $this->end_time);
        $query->bindParam('room_code', $this->room_code);
        $query->bindParam('room_no', $this->room_no);
        $query->bindParam(':semester', $this->semester);
        $query->bindParam(':school_year', $this->school_year);
        $query->execute();
        return true;
    }

    function checkExistingClassDetailsPK($class_id, $excludeClassID = null){
        $sql = "SELECT 
            class.class_id AS class_id,
            class.subject_id AS subject_,
            CONCAT(class.course_abbr, class.year_level, class.section) AS section_
        FROM class_details class
        WHERE class.class_id = :class_id";
        
        if($excludeClassID != null){
            $sql .= " AND class.class_id != :excludeClassID";
        }
        
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $class_id);
        
        if($excludeClassID != null){
            $query->bindParam(':excludeClassID', $excludeClassID);
        }
        
        if($query->execute()){
            $data = $query->fetch(PDO::FETCH_ASSOC);
            return $data ? [
                'class_id' => $data['class_id'], 
                'subject_' => $data['subject_'],
                'section_' => $data['section_']
            ] : null;
        }
        return null;
    }
    
    // Make sure showAllSubjects method exists and is correct
    function showAllSubjects($prospectus_id = '2023-2024'){
        $sql = "SELECT 
                    subject_code,
                    description,
                    total_units,
                    lec_units,
                    lab_units,
                    subject_prospectus_id
                FROM subject_details
                ORDER BY subject_code ASC";
        
        $query = $this->db->connect()->prepare($sql);
        
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll();
        }
        return $data;
    }
    
    function checkSubjectExists($subject_code){
        $sql = "SELECT COUNT(*) as count FROM subject_details WHERE subject_code = :subject_code";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':subject_code', $subject_code);
        $query->execute();
        $result = $query->fetch();
        return $result['count'] > 0;
    }

    
    function insertClassTime(){
        $sql = "INSERT INTO class_time (class_id, subject_id, start_time, end_time) VALUES (:class_id, :subject_id, :start_time, :end_time);";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $this->class_id);
        $query->bindParam(':subject_id', $this->subject_id);
        $query->bindParam(':start_time', $this->start_time);
        $query->bindParam(':end_time', $this->end_time);
        $query->execute();
        $this->class_time_id = $this->db->connect()->lastInsertId();

        return $this->class_time_id;
    }

    function insertClassDay(){
        // This method is deprecated - use insertScheduleDay instead
        // Keeping for backward compatibility but redirecting to insertScheduleDay
        return $this->insertScheduleDay();
    }

    /**
     * Fetch class schedule for the current semester/school year.
     * Optionally filter by room and day.
     */
    public function fetchSchedule($semester, $school_year, $room_code = null, $room_no = null, $day = null){
        $sql = "SELECT
                    sched.day AS class_day,
                    sched.start_time,
                    sched.end_time,
                    sched.room_code,
                    sched.room_no,
                    class.subject_id AS subject_code,
                    CONCAT(class.course_abbr, class.year_level, class.section) AS section_name,
                    CONCAT(acc.last_name, ', ', acc.first_name) AS teacher_name
                FROM class_schedule sched
                LEFT JOIN class_details class ON sched.class_id = class.class_id AND sched.subject_type = class.subject_type
                LEFT JOIN faculty_list fac ON class.teacher_assigned = fac.faculty_id
                LEFT JOIN user_list usr ON fac.user_id = usr.user_id
                LEFT JOIN account acc ON usr.user_id = acc.account_id
                WHERE sched.semester = :semester AND sched.school_year = :school_year
                AND sched.status = 'OCCUPIED'"; // Only show occupied classes in schedule

        if ($room_code !== null && $room_no !== null) {
            $sql .= " AND sched.room_code = :room_code AND sched.room_no = :room_no";
        }
        if ($day !== null) {
            $sql .= " AND sched.day = :day";
        }

        $sql .= " ORDER BY sched.start_time ASC";

        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':semester', $semester);
        $query->bindParam(':school_year', $school_year);

        if ($room_code !== null && $room_no !== null) {
            $query->bindParam(':room_code', $room_code);
            $query->bindParam(':room_no', $room_no);
        }
        if ($day !== null) {
            $query->bindParam(':day', $day);
        }

        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    function getClassScheduleDetail(){
        $sql = "SELECT
                    sched.class_id,
                    sched.subject_type,
                    sched.day AS class_day,
                    sched.start_time,
                    sched.end_time,
                    sched.room_code,
                    sched.room_no,
                    sched.status,
                    sched.remarks
                FROM class_schedule sched
                WHERE sched.class_id = :class_id 
                AND sched.subject_type = :subject_type
                AND sched.day = :day_id
                AND sched.semester = :semester
                AND sched.school_year = :school_year";
        
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $this->class_id);
        $query->bindParam(':subject_type', $this->subject_type);
        $query->bindParam(':day_id', $this->day_id);
        $query->bindParam(':semester', $this->semester);
        $query->bindParam(':school_year', $this->school_year);
        
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    function insertStatus(){
        // This method is deprecated - status is now handled directly in insertScheduleDay
        return true;
    }


    
    public $original_day_id = '';

   
    function showTeacherSchedule(){
        $sql = "SELECT
                stat.class_day_id AS class_status_id,
                cday.id AS cday_id,
                d.day AS week_day,
                room.room_name AS room_name,
                rtype.room_description AS room_type,
                sub.subject_code AS subject_code,
                stdesc.type AS subject_type,
                sec.section_name AS section_name,
                ctime.start_time AS start_time,
                ctime.end_time AS end_time,
                CONCAT(acc.last_name,', ',acc.first_name) AS faculty_name,
                sdesc.description AS room_status

            FROM
                semester sem
            LEFT JOIN 
                scheduled_statuses stat ON sem.semester = stat.semester AND sem.school_year = stat.school_year
            LEFT JOIN 
                status_description sdesc ON stat.status_desc_id = sdesc.id
            LEFT JOIN 
                class_day cday ON stat.class_day_id = cday.id
            LEFT JOIN
                _day d ON cday.day_id = d.id
            LEFT JOIN
                class_time ctime ON cday.class_time_id = ctime.id
            LEFT JOIN
                class_details class ON ctime.class_id = class.id AND ctime.subject_id = class.subject_id
            LEFT JOIN
                room_list room ON class.room_id = room.id
            LEFT JOIN
                room_type rtype ON room.type_id = rtype.id
            LEFT JOIN
                section_details sec ON class.section_id = sec.id
            LEFT JOIN
                course_details course ON sec.course_id = course.id
            LEFT JOIN
                subject_details sub ON class.subject_id = sub.id
            LEFT JOIN
                subject_type_description stdesc ON sub.type_id = stdesc.id
            LEFT JOIN
                faculty_list fac ON class.teacher_assigned = fac.id
            LEFT JOIN 
                account acc ON fac.account_id = acc.id
                
            WHERE sem.semester = :semester AND sem.school_year = :school_year
            AND class.teacher_assigned = :teacher_id
        
        ;";

        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':semester', $this->semester);
        $query->bindParam(':school_year', $this->school_year);
        $query->bindParam(':teacher_id', $this->teacher_assigned);

        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll();
        }
        return $data;


    }

    function showAllStatus($selectedDay = null){
        $sql = 
            "SELECT
                sched.day AS class_day,
                sched.class_id AS class_id,
                sched.subject_type AS subject_type,
                sched.day AS class_day,

                sched.room_code AS room_code,
                sched.room_no AS room_no,

                CONCAT(sched.room_code, ' ', sched.room_no) AS room_name,
                rtype.room_description AS room_type,

                class.subject_id AS subject_code,

                CONCAT(class.course_abbr, class.year_level, class.section) AS section_name,

                sched.start_time AS start_time,
                sched.end_time AS end_time,
                CONCAT(acc.last_name,', ',acc.first_name) AS faculty_name,
                
                sched.status AS room_status,
                sched.remarks AS remarks

            FROM
                semester sem
            LEFT JOIN 
                class_schedule sched ON sem.semester = sched.semester AND sem.school_year = sched.school_year
            LEFT JOIN 
                class_details class ON sched.class_id = class.class_id  AND sched.subject_type = class.subject_type
            LEFT JOIN
                room_list room ON sched.room_code = room.room_code AND sched.room_no = room.room_no
            LEFT JOIN
                room_type rtype ON room.room_code = rtype.room_type_id
            LEFT JOIN
                faculty_list fac ON class.teacher_assigned = fac.faculty_id
            LEFT JOIN 
                user_list user ON fac.user_id = user.user_id
            LEFT JOIN 
                account acc ON user.user_id = acc.account_id
        
                
            WHERE sem.semester = :semester AND sem.school_year = :school_year 
        
        ";

        if($selectedDay !== null){
            $sql .= " AND sched.day = :selectedDay ORDER BY room_name, start_time;";

        }else{
            $sql .= " ORDER BY room_name, start_time;";
        }
        
        // Debug: Log the SQL query and parameters
        error_log("showAllStatus - SQL: " . $sql);
        error_log("showAllStatus - Semester: " . $this->semester . ", Year: " . $this->school_year);
        error_log("showAllStatus - Selected Day: " . ($selectedDay ?? 'null'));
        
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':semester', $this->semester);
        $query->bindParam(':school_year', $this->school_year);

        if($selectedDay !== null){
            $query->bindParam(':selectedDay', $selectedDay);
        }

        $data = null;
        if ($query->execute()){
            $data = $query->fetchAll();
            error_log("showAllStatus - Query executed successfully, results: " . count($data));
        } else {
            error_log("showAllStatus - Query execution failed: " . implode(", ", $query->errorInfo()));
        }
        return $data;
    }


    function showAllClassDetails(){
        $sql = 
            "SELECT 
                class.class_id AS class_id,
                class.subject_type AS subject_type,
                CONCAT (class.class_id ,'|', class.subject_type) AS id,
                CONCAT(class.subject_id,' ', class.subject_type) AS subject_, 
                CONCAT(class.course_abbr, class.year_level, class.section) AS section_, 
                CONCAT(acc.last_name,', ',acc.first_name) AS teacher_ 

            FROM class_details class 
            LEFT JOIN section_details sec ON class.course_abbr = sec.course_abbr AND class.year_level = sec.year_level AND class.section = sec.section
            LEFT JOIN faculty_list fac ON class.teacher_assigned = fac.faculty_id
            LEFT JOIN user_list user ON fac.user_id = user.user_id
            LEFT JOIN account acc ON user.user_id = acc.account_id
            ORDER BY section_";

        $query = $this->db->connect()->prepare($sql);

        $data = null;
        if ($query->execute()){
            $data = $query->fetchAll();
        }
        return $data;
    }
    
    //check if subject has a LEC and LAB units
    function checkSubjectType($subject_id, $type){
        $sql = "SELECT subject_code, lec_units, lab_units
            FROM subject_details sub
            WHERE subject_code = :subject_code ";
        
        if ($type == "LEC") {
            $sql .= " AND lec_units = 0;";
        } else if ($type == "LAB") {
            $sql .= " AND lab_units = 0;";
        }

        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':subject_code', $subject_id);

        if ($query->execute()) {
            $data = $query->fetch(PDO::FETCH_ASSOC);
            return $data; // Return the full array with both lec_units and lab_units
        }
        return null;
    }

    
    function checkClassSubtypeExisting($classID, $subType, $excludeClassID = null, $excludeSubType = null){
        $sql = "SELECT c.subject_type AS stype, s.lec_units AS lec_units, s.lab_units AS lab_units
            FROM class_details c LEFT JOIN subject_details s ON c.subject_id = s.subject_code
            WHERE c.class_id = :class_id AND c.subject_type = :subType ";

        if($excludeClassID != null && $excludeSubType != null){
        $sql .= 'AND (c.class_id != :excludeClassID AND c.subject_type != :excludeSubType);';
        }


        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $classID);
        $query->bindParam(':subType', $subType);

        if($excludeClassID != null && $excludeSubType != null){
            $query->bindParam(':excludeClassID', $excludeClassID);   
            $query->bindParam(':excludeSubType', $excludeSubType);   
        }

        if ($query->execute()) {
            $data = $query->fetch(PDO::FETCH_ASSOC);

            if(!empty($data) && $data['stype'] == 'LEC'){
                return $data ? ['lec_units' => $data['lec_units'], 'lab_units' => $data['lab_units']] : null;
            }

            if(!empty($data) && $data['stype'] == 'LAB'){
                return $data ? ['lec_units' => $data['lec_units'], 'lab_units' => $data['lab_units']] : null;
            }
        }
        return null;
    }

    function alternateClassSubtype($classID){
        $sql = "SELECT subject_type
        FROM class_details 
        WHERE class_id = :class_id;";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $classID);
        $query->execute();
        $data = $query->fetch(PDO::FETCH_ASSOC);
        return $data? $data['subject_type'] : null;
    }
    

 
    //CHECK IF EXISTING SUBJECT EXIST ON A SECTION
    function checkSubjectSectionExisting($excludeID){
        $sql = "SELECT class.class_id AS class_id
        FROM class_details class
        WHERE (class.subject_id = :subject_id AND class.subject_type = :subject_type) AND (class.course_abbr = :course_abbr AND class.year_level = :year_level AND class.section = :section)";
        
        if($excludeID != null){
            $sql .= " AND class.class_id != :excludeID";
        }

        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':subject_type', $this->subject_type);
        $query->bindParam(':subject_id', $this->subject_id);
        $query->bindParam(':course_abbr', $this->course_abbr);
        $query->bindParam(':year_level', $this->year_level);
        $query->bindParam(':section', $this->section);
        
        if($excludeID != null){
            $query->bindParam(':excludeID', $excludeID);   
        }

        if ($query->execute()) {
            $data = $query->fetch(PDO::FETCH_ASSOC);
            return $data ? $data['class_id'] : null;
        }
        return null;
    }

    function checkClassIDExisting($recordID){
        $sql = "SELECT 
            DISTINCT class.class_id AS class_id, 
            CONCAT(class.course_abbr, class.year_level, class.section) AS section_

        FROM class_details class 

        WHERE class.class_id = :class_id
        ;";

        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $recordID);

        if ($query->execute()) {
            $data = $query->fetch(PDO::FETCH_ASSOC);
            return $data ? $data['section_'] : null; 
        }
        return null;

    }


    //CHECK IF EXISTING SUBJECT_NAME AND SECTION_NAME ALREADY EXIST, condition for class id when it can be unique
    function checkConditionClassDetailPK(){
        $sql = "SELECT
            DISTINCT class.subject_id AS subject_id,
            class.class_id AS class_id,
            CONCAT(class.course_abbr, class.year_level, class.section) AS section_name

        FROM class_details class

        WHERE class.subject_id = :subject_id AND (class.course_abbr = :course_abbr AND class.year_level = :year_level AND class.section = :section)
        ;";

        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':subject_id', $this->subject_id);
        $query->bindParam(':course_abbr', $this->course_abbr);
        $query->bindParam(':year_level', $this->year_level);
        $query->bindParam(':section', $this->section);
        $query->execute();
        $data = $query->fetch(PDO::FETCH_ASSOC);
        return $data ? ['class_id' => $data['class_id'], 'subject_id' => $data['subject_id'], 'section_name' => $data['section_name']] : null;
    }

 
    //CHECK IF AN EXISTING TIME ROW ALREADY EXIST ON TABLE
    function checkExistingClassTime($excludeClassID = null, $excludeSubtype = null, $excludeDay = null){
        $sql = "SELECT      
        s.class_id AS class_id,
        s.subject_type AS sub_type,
        s.day AS day_name,
        s.start_time AS start_time,
        s.end_time AS end_time,
        CONCAT(s.room_code, ' ', s.room_no) AS room

        FROM class_schedule s

        WHERE s.day = :day_id AND (
        s.room_code = :room_code AND s.room_no = :room_no
        ) AND (
        -- Overlap only when intervals strictly intersect: start < new_end AND end > new_start
        (s.start_time < :end_time AND s.end_time > :start_time)
        )";

        if ($excludeClassID != null && $excludeSubtype != null && $excludeDay != null){
            $sql .= " AND (s.class_id != :excludeClassID AND s.subject_type != :excludeSubtype AND s.day != :excludeDay)";
        }

        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':start_time', $this->start_time);
        $query->bindParam(':end_time', $this->end_time);
        $query->bindParam(':day_id', $this->day_id);
        $query->bindParam(':room_code', $this->room_code);
        $query->bindParam(':room_no', $this->room_no);
        
        if ($excludeClassID != null && $excludeSubtype != null && $excludeDay != null) {
            $query->bindParam(':excludeClassID', $excludeClassID);
            $query->bindParam(':excludeSubtype', $excludeSubtype);
            $query->bindParam(':excludeDay', $excludeDay);
        }
        
        if ($query->execute()) {
            $data = $query->fetch(PDO::FETCH_ASSOC);
            return $data ? [$data['class_id'], $data['day_name'], $data['start_time'], $data['end_time'], $data['room']] : null;
        } 
        return null;
    }

    //CHECK IF CLASS ID ON DAY EXIST, CHECKS IF ROW DATA EXIST ON CLASS_SCHEDULE
    function checkClassDayAlreadyExist($excludeClassID = null, $excludeSubtype = null, $excludeDay = null){
        $sql = "SELECT      
        s.class_id AS class_id,
        s.subject_type AS sub_type,
        s.day AS day_name,
        s.start_time AS start_time,
        s.end_time AS end_time,
        CONCAT(s.room_code, ' ', s.room_no) AS room

        FROM class_schedule s

        WHERE s.class_id = :class_id AND s.subject_type = :subject_type AND s.day = :class_day";

        if ($excludeClassID != null && $excludeSubtype != null && $excludeDay != null){
            $sql .= " AND (s.class_id != :excludeClassID AND s.subject_type != :excludeSubtype AND s.day != :excludeDay)";
        }

        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $this->class_id);
        $query->bindParam(':subject_type', $this->subject_type);
        $query->bindParam(':class_day', $this->day_id);

        if ($excludeClassID != null && $excludeSubtype != null && $excludeDay != null) {
            $query->bindParam(':excludeClassID', $excludeClassID);
            $query->bindParam(':excludeSubtype', $excludeSubtype);
            $query->bindParam(':excludeDay', $excludeDay);
        }

        if ($query->execute()) {
            $data = $query->fetch(PDO::FETCH_ASSOC);
            return $data ? [$data['class_id'], $data['day_name'], $data['start_time'], $data['end_time'], $data['room']] : null;
        } 
        return null;
      
    }

    function fetchclassDetailsRecord($classID, $subType){
        // $sql = "SELECT * FROM class_details WHERE id = :recordID;";
        $sql = 
            "SELECT 
                class.class_id AS class_id,
                class.subject_type AS subtype_id,

                class.subject_id AS subject_id,
                CONCAT(sub.lec_units,'|',sub.lab_units) AS subject_units,

                CONCAT(class.course_abbr,'|', class.year_level,'|', class.section) AS section_id,
                CONCAT(class.course_abbr, class.year_level, class.section) AS section_name, 
                
                class.teacher_assigned AS teacher_id,
                CONCAT(acc.last_name,', ',acc.first_name) AS teacher_name 

            FROM class_details class 
            LEFT JOIN section_details sec ON class.course_abbr = sec.course_abbr AND class.year_level = sec.year_level AND class.section = sec.section
            LEFT JOIN subject_details sub ON class.subject_id = sub.subject_code
            LEFT JOIN faculty_list fac ON class.teacher_assigned = fac.faculty_id
            LEFT JOIN user_list user ON fac.user_id = user.user_id
            LEFT JOIN account acc ON user.user_id = acc.account_id
            
            WHERE class.class_id = :classID AND class.subject_type = :subType
        ;";
        
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':classID', $classID);
        $query->bindParam(':subType', $subType);

        $data = null;
        if ($query->execute()) {
            $data = $query->fetch(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    function fetchroomstatusRecord($recordClassID, $recordSubType, $recordClassDay){
        $sql = "SELECT 
        sched.id AS schedule_id,
        rl.room_name AS room_name,
        sd.subject_code AS subject_code,
        sd.subject_name AS subject_name,
        CONCAT(a.first_name, ' ', a.last_name) AS instructor_name,
        ct.start_time AS start_time,
        ct.end_time AS end_time,
        GROUP_CONCAT(d.day_name ORDER BY d.id) AS days
    FROM class_schedule sched
    JOIN room_list rl ON sched.room_id = rl.id
    JOIN subject_details sd ON sched.subject_id = sd.id
    JOIN faculty_list fl ON cd.teacher_assigned = fl.id
    JOIN account a ON fl.account_id = a.id
    JOIN class_schedule sched ON sched.schedule_id = sched.id
    JOIN sched_day scd ON scd.schedule_time_id = ct.id
    JOIN day d ON sd.day_id = d.id
    GROUP BY sched.id, rl.room_name, sd.subject_code, sd.subject_name, 
             a.first_name, a.last_name, ct.start_time, ct.end_time
    ORDER BY rl.room_name, ct.start_time";;
       
        
        
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':recordClassID', $recordClassID);
        $query->bindParam(':recordSubType', $recordSubType);
        $query->bindParam(':recordClassDay', $recordClassDay);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetch(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    function classTimeExistsOnDay($selected_day, $class_time_id) {
       
        $sql = "SELECT 
                COUNT(*) 
            FROM class_day cd
            LEFT JOIN class_time ct ON cd.class_time_id = ct.id
            WHERE cd.day_id = :day_id 
            AND cd.class_time_id != :class_time_id 
        ;";
        
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':day_id', $selected_day);
        $query->bindParam(':class_time_id', $class_time_id);
        $query->execute();
    
        return $query->fetchColumn() > 0;
    }

    


    function deleteClassDetails(){
        $sql = "DELETE FROM class_details WHERE class_id = :class_id AND subject_type = :subject_type;";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $this->class_id);
        $query->bindParam(':subject_type', $this->subject_type);
        $query->execute();
        return true;
    }

    function deleteClassSchedule(){
        // Start transaction
        $conn = $this->db->connect();
        $conn->beginTransaction();
        
        try {
            // Debug logging
            error_log("Attempting to delete: class_id={$this->class_id}, subject_type={$this->subject_type}, day_id={$this->day_id}");
            
            // Delete from class_schedule table
            $sql = "DELETE FROM class_schedule WHERE class_id = :class_id AND subject_type = :subject_type AND `day` = :class_day";
            $query = $conn->prepare($sql);
            $query->bindParam(':class_id', $this->class_id);
            $query->bindParam(':subject_type', $this->subject_type);
            $query->bindParam(':class_day', $this->day_id);
            $result1 = $query->execute();
            
            error_log("Class schedule deletion result: " . ($result1 ? 'success' : 'failed'));
            
            // Delete from class_details table
            $sql = "DELETE FROM class_details WHERE class_id = :class_id AND subject_type = :subject_type";
            $query = $conn->prepare($sql);
            $query->bindParam(':class_id', $this->class_id);
            $query->bindParam(':subject_type', $this->subject_type);
            $result2 = $query->execute();
            
            error_log("Class details deletion result: " . ($result2 ? 'success' : 'failed'));
            
            if ($result1 && $result2) {
                // Commit transaction
                $conn->commit();
                error_log("Transaction committed successfully");
                return true;
            } else {
                throw new Exception("One or more deletions failed");
            }
            
        } catch (PDOException $e) {
            // Rollback transaction on error
            $conn->rollback();
            error_log("Delete transaction failed: " . $e->getMessage());
            return false;
        }
    }

    function fetchRoomName($recordID){
        $sql = "SELECT room_name FROM room_list WHERE id = :recordID;";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':recordID', $recordID);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetch(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    
    function getCurrentStatus(){
        $sql = "SELECT status FROM class_schedule 
                WHERE class_id = :class_id 
                AND subject_type = :subject_type 
                AND day = :class_day
                AND semester = :semester
                AND school_year = :school_year";
        
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $this->class_id);
        $query->bindParam(':subject_type', $this->subject_type);
        $query->bindParam(':class_day', $this->day_id);
        $query->bindParam(':semester', $this->semester);
        $query->bindParam(':school_year', $this->school_year);
        
        if ($query->execute()) {
            $result = $query->fetch(PDO::FETCH_ASSOC);
            return $result ? $result['status'] : null;
        }
        return null;
    }

    function toggleClassStatus(){
        $sql = "UPDATE class_schedule 
                SET status = CASE 
                    WHEN status = 'OCCUPIED' THEN 'AVAILABLE'
                    WHEN status = 'AVAILABLE' THEN 'OCCUPIED'
                    ELSE 'OCCUPIED'
                END
                WHERE class_id = :class_id 
                AND subject_type = :subject_type 
                AND day = :class_day
                AND semester = :semester
                AND school_year = :school_year";
        
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':class_id', $this->class_id);
        $query->bindParam(':subject_type', $this->subject_type);
        $query->bindParam(':class_day', $this->day_id);
        $query->bindParam(':semester', $this->semester);
        $query->bindParam(':school_year', $this->school_year);
        
        if ($query->execute()) {
            return true;
        } else {
            error_log("Toggle status failed: " . implode(", ", $query->errorInfo()));
            return false;
        }
    }

    function roomnameExists($room_name, $excludeID = null){
        $sql = "SELECT COUNT(*) FROM room_list WHERE room_name = :room_name";
        if ($excludeID) {
            $sql .= " AND id != :excludeID";
        }
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':room_name', $room_name);
        if ($excludeID) {
            $query->bindParam(':excludeID', $excludeID);
        }
        $query->execute();
        $count = $query->fetchColumn();
        return $count > 0;
    }

    //fetch room type for dropdown
    public function fetchroomType(){
        $sql = 
            "SELECT room_type_id as type_id, room_description AS rtype_desc 
            FROM room_type
            ORDER BY rtype_desc ASC;
        
        ;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    //for filter dropdown, room_name in room list
    public function fetchroomList(){
        $sql = " SELECT *, CONCAT(room_code, ' ', room_no) AS room_name FROM room_list;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    public function fetchRoomOption(){
        $sql = "SELECT room_code, room_no, CONCAT(room_code, ' ', room_no) AS room_name FROM room_list ORDER BY room_code, room_no";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }


    //for filter dropdown status list
    public function fetchstatusOption(){
        $sql = " SELECT sd.description AS status_desc FROM status_description sd;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    //for filter dropdown search subject code
    public function fetchsubjectOption(){
        $sql = 
        " SELECT 
            sub.subject_code AS subject_id, 
            sub.description AS subject_name,
            CONCAT(sub.lec_units,'|',sub.lab_units) AS subject_units
          FROM subject_details sub";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    //for semester dropdown
    public function fetchsemesterOption(){
        $sql = "SELECT 
                sem.semester AS semester_id,
                sem.description AS semester_desc,
                sem.school_year AS school_year

            FROM semester sem
            
            ORDER BY school_year ASC;
            
            ;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }


    //for semester dropdown
    public function fetchclassesOption(){
        try {
            $sql = "SELECT 
                    class.class_id,
                    class.subject_id,
                    CONCAT(class.class_id, ' - ', class.subject_id) AS subject_name,
                    class.subject_type,
                    CONCAT(class.course_abbr, class.year_level, class.section) AS section_name
                FROM class_details class
                ORDER BY class.class_id ASC";
            
            $query = $this->db->connect()->prepare($sql);
            $data = null;
            if ($query->execute()) {
                $data = $query->fetchAll(PDO::FETCH_ASSOC);
                error_log("fetchclassesOption: Successfully fetched " . count($data) . " classes");
            } else {
                error_log("fetchclassesOption: Query execution failed - " . implode(", ", $query->errorInfo()));
            }
            return $data;
        } catch (PDOException $e) {
            error_log("fetchclassesOption: Database error - " . $e->getMessage());
            return [];
        }
    }

     public function createDefaultScheduleEntries() {
        // DISABLED: Auto-creation of schedule entries for all weekdays
        // This was causing schedules to be created for all days (Monday-Friday) 
        // regardless of user selection. Users should manually add schedules.
        /*
        // Create default schedule entries for Monday-Friday with AVAILABLE status
        // Use existing room from room_list table
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        foreach ($days as $day) {
            $sql = "INSERT INTO class_schedule 
                    (class_id, subject_type, day, start_time, end_time, status, remarks, room_code, room_no, semester, school_year) 
                    VALUES (?, ?, ?, '08:00:00', '09:00:00', 'AVAILABLE', 'No schedule yet', 'LR', 1, ?, ?)";
            
            $query = $this->db->connect()->prepare($sql);
            $query->execute([$this->class_id, $this->subject_type, $day, $this->semester, $this->school_year]);
        }
        */
    }

    //for filter dropdown search Teacher
    public function fetchteacherOption(){
        // Simplified query - just get faculty_id and create a simple teacher name
        $sql = "SELECT fac.faculty_id AS faculty_id, CONCAT('Teacher ', fac.faculty_id) AS teacher_name 
        FROM faculty_list fac";
        
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
            error_log("Teacher query result: " . print_r($data, true));
        } else {
            error_log("Teacher query failed: " . print_r($query->errorInfo(), true));
        }
        return $data;
    }

    //for filter dropdown subject code
    public function fetchsubjectnameOption(){
        $sql = " SELECT DISTINCT subject_code FROM subject_details;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }
    
    //for filter dropdown subject type
    public function fetchsubtypeOption(){
        $sql = " SELECT std.type AS subject_type FROM subject_type_description std;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    //for filter dropdown section
    public function fetchsectionOption(){
        $sql = "SELECT * FROM section_details;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    //for filter dropdown Day
    public function fetchdayOption(){
        $sql = "SELECT section_name FROM section_details 
        ;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

   

    
    //fetch course for radio button
    public function fetchCourse(){
        $sql = "SELECT course_abbr, course_name FROM course_details;";
        $query = $this->db->connect()->prepare($sql);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

    // Method to fetch sections based on the selected course ID
    public function fetchSectionsByCourseId($courseId) {
        $sql = "SELECT section_name FROM section_details WHERE course_id = :course_id";
        $query = $this->db->connect()->prepare($sql);
        $query->bindParam(':course_id', $courseId);
        $data = null;
        if ($query->execute()) {
            $data = $query->fetchAll(PDO::FETCH_ASSOC);
        }
        return $data;
    }

}

    //cday.id AS cday_id,
    // d.day AS week_day,
    // room.room_name AS room_name,
    // rtype.room_description AS room_type,
    // sub.subject_code AS subject_code,
    // stdesc.type AS subject_type,
    // sec.section_name AS section_name,
    // ctime.start_time AS start_time,
    // ctime.end_time AS end_time,
    // CONCAT(acc.last_name,', ',acc.first_name) AS faculty_name,
    // sdesc.description AS room_status

   //OLD QUERIES
    //OLD updateClassDetails
    // function updateClassDetails(){
    //     $sql = "UPDATE class_details SET room_id = :room_id, subject_id = :subject_id, section_id = :section_id, teacher_assigned = :teacher_id WHERE id = :class_id;";
    //     $query = $this->db->connect()->prepare($sql);
    //     $query->bindParam(':class_id', $this->class_id);
    //     $query->bindParam(':room_id', $this->room_id);
    //     $query->bindParam(':subject_id', $this->subject_id);
    //     $query->bindParam(':section_id', $this->section_id);
    //     $query->bindParam(':teacher_id', $this->teacher_assigned);
    //     $query->execute();
    //     return true;
    // }

    // function updateClassTime(){
    //     $sql = "UPDATE class_time SET start_time = :start_time, end_time = :end_time WHERE id = :class_time_id;";
    //     $query = $this->db->connect()->prepare($sql);
    //     $query->bindParam(':class_time_id', $this->class_time_id);
    //     $query->bindParam(':start_time', $this->start_time);
    //     $query->bindParam(':end_time', $this->end_time);
    //     $query->execute();
    //     return true;
    // }

    // function updateClassDay(){
    //     $sql = "UPDATE class_day SET day_id = :day_id WHERE id = :class_day_id;";
    //     $query = $this->db->connect()->prepare($sql);
    //     $query->bindParam(':class_day_id', $this->class_day_id);
    //     $query->bindParam(':day_id', $this->day_id);
    //     $query->execute();
    //     return true;
    // }


//OLD
    // function insertClassDetails(){
    //     if($this->newClass == true){
    //         $sql = "INSERT INTO class_details (room_id, subject_id, section_id, teacher_assigned) VALUES (:room_id, :subject_id, :section_id, :teacher_id);";
    //         $query = $this->db->connect()->prepare($sql);
    //         $query->bindParam(':room_id', $this->room_id);
    //         $query->bindParam(':subject_id', $this->subject_id);
    //         $query->bindParam(':section_id', $this->section_id);
    //         $query->bindParam(':teacher_id', $this->teacher_assigned);
    //         $query->execute();

    //         $this->class_id = $this->db->connect()->lastInsertId();

    //         return $this->class_id;
    //     }

    //     return true;
    // }

    // function insertClassTime(){
    //     if($this->newtime == true){
    //         $sql = "INSERT INTO class_time (class_id, start_time, end_time) VALUES (:class_id, :start_time, :end_time);";
    //         $query = $this->db->connect()->prepare($sql);
    //         $query->bindParam(':class_id', $this->class_id);
    //         $query->bindParam(':start_time', $this->start_time);
    //         $query->bindParam(':end_time', $this->end_time);
    //         $query->execute();

    //         $this->class_time_id = $this->db->connect()->lastInsertId();

    //         return $this->class_time_id;
    //     }
    //     return true;
    // }


    // function insertClassDay(){
    //     if($this->newDay == true){
    //         $sql = "INSERT INTO class_day (day_id, class_time_id) VALUES (:day_id, :class_time_id);";
    //         $query = $this->db->connect()->prepare($sql);
    //         $query->bindParam(':day_id', $this->day_id);
    //         $query->bindParam(':class_time_id', $this->class_time_id);
    //         $query->execute();

    //         $this->class_day_id = $this->db->connect()->lastInsertId();

    //         return $this->class_day_id;
    //     }
    //     return true;
    // }

    // function insertStatus(){
    //     $sql = "INSERT INTO _status (class_day_id) VALUES (:class_day_id);";
    //     $query = $this->db->connect()->prepare($sql);
    //     $query->bindParam(':class_day_id', $this->class_day_id);
    //     $query->execute();
    //     return true;
    // }



    // function addroomStatus() {// 1. Insert into class_details
        
    //     if($this->newClass == false){
    //         $sql1 = "INSERT INTO class_details (room_id, subject_id, section_id, teacher_assigned) VALUES (:room_id, :subject_id, :section_id, :teacher_id);";
    //         $query1 = $this->db->connect()->prepare($sql1);
    //         $query1->bindParam(':room_id', $this->room_id);
    //         $query1->bindParam(':subject_id', $this->subject_id);
    //         $query1->bindParam(':section_id', $this->section_id);
    //         $query1->bindParam(':teacher_id', $this->teacher_assigned);
    //         $query1->execute();

    //         // 2. Get the last inserted ID from class_details
    //         $this->class_id = $this->db->connect()->lastInsertId();
    //     }          
        
    //     if ($this->newtime == false){//if there is no existing class time id
    //         $this->log_cid[]= $this->class_id; 

    //         // 3. Insert into class_time
    //         $sql2 = "INSERT INTO class_time (class_id, start_time, end_time) VALUES (:class_id, :start_time, :end_time)";
    //         $query2 = $this->db->connect()->prepare($sql2);
    //         $query2->bindParam(':class_id', $this->class_id);
    //         $query2->bindParam(':start_time', $this->start_time);
    //         $query2->bindParam(':end_time', $this->end_time);
    //         $query2->execute();
    //         $this->class_time_id = $this->db->connect()->lastInsertId();
    //     }


    //     foreach ($this->day_id as $day) {
    //         if (!$this->insertDayStatus($this->class_time_id, $day)) {
    //             return false; // Stop if insertion fails
    //         }
    //     }
        
    //     return true;
    // }

    
    // function insertDayStatus($time_id, $day) {// 1. Insert into class_day
    //     if($this->newDay == false){
    //         $this->log_ctid[]=$time_id; 
    //         $this->log_day[]=$day; 
    //         $sql1 = "INSERT INTO class_day (day_id, class_time_id) VALUES (:day_id, :class_time_id)";
    //         $query1 = $this->db->connect()->prepare($sql1);
    //         $query1->bindParam(':day_id', $day); // Bind the current day_id
    //         $query1->bindParam(':class_time_id', $time_id); // Use the class_time_id
            
    //         // Check if the insertion was successful
    //         if ($query1->execute()) {
    //             // 2. Get the last inserted ID from class_day
    //             $this->class_day_id = $this->db->connect()->lastInsertId();
    //             $this->log_cdid[] = $this->class_day_id; 

    //             // 3. Insert into _status
    //             $sql2 = "INSERT INTO _status (class_day_id, status_desc_id) VALUES (:class_day_id, :status_desc_id)";
    //             $query2 = $this->db->connect()->prepare($sql2);
    //             $query2->bindParam(':class_day_id', $this->class_day_id); // Bind the current class_day_id
    //             $default_status_desc_id = 2; // Assuming 2 is the default status ID
    //             $query2->bindParam(':status_desc_id', $default_status_desc_id);
    //             $query2->execute();

    //             return true; // Indicate successful insertion
    //         }
            
    //         return false; // Indicate failure to insert
    //     }else{
    //         $sql = "UPDATE class_day SET id=:class_day_id, day_id = :day_id , class_time_id= :class_time_id";




    //         return false; // Indicate failure to insert
    //     }

    // }

 // function editroomStatus() {
    //     try {
    //         // 1. Update class_details
    //         if($this->newClass == true){
                
    //             $sql1 = 
    //             "UPDATE class_details 
    //             SET room_id = :room_id, 
    //                 subject_id = :subject_id, 
    //                 section_id = :section_id, 
    //                 teacher_assigned = :teacher_id 
    //             WHERE id = :class_id";
    //             $query1 = $this->db->connect()->prepare($sql1);
    //             $query1->bindParam(':class_id', $this->class_id);
    //             $query1->bindParam(':room_id', $this->room_id);
    //             $query1->bindParam(':subject_id', $this->subject_id);
    //             $query1->bindParam(':section_id', $this->section_id);
    //             $query1->bindParam(':teacher_id', $this->teacher_assigned);
    //             $query1->execute();
    //         }
                
    //         // 2. Update class_time
    //         if($this->newtime == true){
    //             $sql2 = 
    //             "UPDATE class_time 
    //             SET start_time = :start_time, 
    //                 end_time = :end_time 
    //             WHERE id = :class_time_id";
    //             $query2 = $this->db->connect()->prepare($sql2);
    //             $query2->bindParam(':class_time_id', $this->class_time_id);
    //             $query2->bindParam(':start_time', $this->start_time);
    //             $query2->bindParam(':end_time', $this->end_time);
    //             $query2->execute();
    //         }
            
           

    //         if($this->newDay == true){
    //             foreach ($this->day_id as $day) {
    //                 if (!$this->insertDayStatus($this->class_time_id, $day)) {
    //                     return false; // Stop if insertion fails
    //                 }
    //             }
    //         }
        
           
    //         return true;
    //     } catch (PDOException $e) {
    //         $this->db->connect()->rollBack();
    //         error_log("Error in editroomStatus: " . $e->getMessage());
    //         return false;
    //     }
    // }


        // $sql ="SELECT
        //     sub.subject_code AS subject_code
        // FROM class_details class
        // LEFT JOIN subject_details sub ON class.subject_id = sub.id
        // LEFT JOIN subject_type_description stdesc ON sub.type_id = stdesc.id
        // LEFT JOIN section_details sec ON class.section_id = sec.id
        
        // WHERE sub.subject_code = 'CC103' AND class.section_id = 8;";



    //CHECK IF AN EXISTING ROW ALREADY EXIST ON TABLE, USED ON SAVE-CLASS-DETAIL.PHP
    // function checkExistingClassDetails(){
    //     $sql = "SELECT (class.id) AS class_id
    //     FROM class_details class
    //     WHERE class.room_id = :room_id 
    //     AND class.section_id = :section_id 
    //     AND class.subject_id = :subject_id 
    //     AND class.teacher_assigned = :teacher_id;";

    //     $query = $this->db->connect()->prepare($sql);
    //     $query->bindParam(':room_id', $this->room_id);
    //     $query->bindParam(':section_id', $this->section_id);
    //     $query->bindParam(':subject_id', $this->subject_id);
    //     $query->bindParam(':teacher_id', $this->teacher_assigned);
        
    //     if ($query->execute()) {
    //         $data = $query->fetch(PDO::FETCH_ASSOC);
    //         return $data ? $data['class_id'] : null;  // Return just the ID if found
    //     }
    //     return null;
    // }

?>

