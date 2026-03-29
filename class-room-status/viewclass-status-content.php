<?php
// Add these at the top of viewroomlist.php
require_once '../tools/functions.php';  // Add this line
  
?>
<?php
session_start();

// Add cache control headers to prevent caching
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if (isset($_SESSION['account'])) {
    if (!$_SESSION['account']) {
        header('location: ../account/loginwcss.php');
    }
} else {
    header('location: ../account/loginwcss.php');
}
?>

<div class="container-fluid">
    <?php
        require_once '../classes/room-status.class.php';
        
        $roomObj = new RoomStatus();   
        
        $split_PK = $semester_PK = '';
        
        $semester_PK = $_SESSION['selected_semester_id'];
        $split_PK = explode('|', $semester_PK);
        $roomObj->semester = $split_PK[0];
        $roomObj->school_year = $split_PK[1];
    ?>

<!-- Add this section BEFORE the "CLASS DETAILS LIST" section in viewclass-status.php -->

<div class="row admin">
    <div class="col-12">
        <div class="page-title-box">
            <h1 class="page-title">SUBJECT LIST</h1>
        </div>
    </div>
</div>

<div class="row admin">
    <div class="col-12">
        <div class="card p-4">
            
            <div class="card-body p-1 pt-2">
                <div class="d-flex ct1 flex-row align-items-start gap-5">
                    
                    <div class="input-group w-25">
                        <input type="text" id="search-subject" class="form-control form-control-light" placeholder="Search subjects...">
                        <span class="input-group-text bg-primary border-primary text-white brand-bg-color">
                            <i class="bi bi-search"></i>
                        </span>
                    </div>

                    <div class="input-group w-25">
                        <select name="prospectus" id="prospectus" class="form-select">
                            <option value="2024-2025" selected>2024-2025</option>
                            <option value="2023-2024">2023-2024</option>
                        </select>
                    </div>
                
                    <!-- Add Subject -->
                    <a id="add-subject-details" href="#" class="btn admin btn-primary">Add Subject</a>
                </div>

                <div class="table-responsive">
                    <!-- Table Subject Details -->
                    <table id="table-subject-details" class="table table-centered table-nowrap table-hover mb-0">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Subject Code</th>
                                <th>Description</th>
                                <th>Total Units</th>
                                <th>Lec Units</th>
                                <th>Lab Units</th>
                                <th style="width: 20%;">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            <?php
                                $i = 1;
                                $array = $roomObj->showAllSubjects();
                                
                                foreach ($array as $arr) {
                            ?>
                                <tr>
                                    <td><?= $i ?></td>
                                    <td><?= $arr['subject_code'] ?></td>
                                    <td><?= $arr['description'] ?></td>
                                    <td><?= $arr['total_units'] ?></td>
                                    <td><?= $arr['lec_units'] ?></td>
                                    <td><?= $arr['lab_units'] ?></td>
                                    <td class="text-nowrap">
                                        <a href="#" class="btn admin edit-subject" data-subjectcode="<?= $arr['subject_code'] ?>">Edit</a>
                                        <a href="#" class="btn admin delete delete-subject" data-subjectcode="<?= $arr['subject_code'] ?>">Delete</a>
                                    </td>
                                </tr>
                            <?php
                                $i++;
                                }
                            ?>
                        </tbody>
                    </table>
                </div> <!-- end table-responsive-->
            </div>

        </div>
    </div>
</div>
   
    <div class="row admin">
        <div class="col-12">
            <div class="page-title-box">
                <h1 class="page-title">CLASS DETAILS LIST</h1>
            </div>
        </div>
    </div>
    <div class="modal-container"></div>

    <div class="row admin">
        <div class="col-12">
            <div class="card p-4">
                
                <div class="card-body p-1 pt-2">
                    <div class="d-flex ct1 flex-row align-items-start justify-content-between">
                        
                        <div class="input-group w-25">
                            <input type="text" id="search-class-details" class="form-control form-control-light" placeholder="Search class details...">
                            <span class="input-group-text bg-primary border-primary text-white brand-bg-color">
                                <i class="bi bi-search"></i>
                            </span>
                        </div>

                        <!-- 1. Add Class Details   -->
                        <a id="add-class-details" href="#" class="btn admin btn-primary open-modal-button">Add Class Details</a>
                    </div>
                    <div class="table-responsive">
                        <!-- 2. Table Class Details -->
                        <table id="table-class-details" class="table table-centered table-nowrap table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Subject</th>
                                    <th>Section</th>
                                    <th>Teacher</th>
                                    <th style="width: 30%;">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                <?php
                                    

                                    $array = $roomObj->showAllClassDetails();
                                    
                                    foreach ($array as $arr) {
                                ?>
                                    <tr>
                                        <td><?= $arr['class_id'] ?></td>
                                        <td><?= $arr['subject_'] ?></td>
                                        <td><?= $arr['section_'] ?></td>
                                        <td><?= $arr['teacher_'] ?></td>
                                        <td class="text-nowrap">
                                            <a href="" class="btn admin w-50 edit-class-details" data-classid="<?= $arr['class_id']?>" data-subtype="<?= $arr['subject_type']?>">Edit</a>
                                            <a href="" class="btn admin w-50 delete delete-class-details" data-classid="<?= $arr['class_id']?>" data-subtype="<?= $arr['subject_type']?>">Delete</a>
                                        </td>
                                    </tr>
                                <?php } ?>
                            </tbody>
                        </table>
                    </div> <!-- end table-responsive-->
                </div>


            </div>
        </div>
    </div>



    <div class="row">
        <div class="col-12">
            <div class="page-title-box">
                <h1 class="page-title">CLASS STATUS LIST</h1>
            </div>
        </div>
    </div>
    <div class="modal-container"></div>

    <div class="row">
        <div class="col-12">
            <div class="card p-4">
                
                <div class="d-flex justify-content-between align-items-center gap-4">
                    
                    <div class="d-flex ct1 flex-row align-items-start gap-5">
                        <form id ="room-form" class="d-flex flex-column justify-content-between align-items-start gap-3"><!-- #room_form handling filter form-->
                            <div class="d-flex width flex-column align-items-start gap-1">
                                <div class="d-flex width align-items-center">
                                    <P class="me-2 mb-0 label-text">Room Name:</P>
                                    <div class="dropdown">
                                        <input type="text" class="form-control dropdown-input" placeholder="Filter search..." id="dropdown-room-name" name="room-name" >
                                        <input type="hidden" id="hidden-room-id" name="room-id"/>
                                        <div class="dropdown-list" id="dropdown-list-room-name">
                                            <!-- Options will be populated here by JavaScript -->
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="d-flex width align-items-center">
                                    <P class="me-2 mb-0 label-text">Room Type:</P>
                                    <div class="dropdown">
                                        <input type="text" class="form-control dropdown-input" placeholder="Filter search..." id="dropdown-room-type" name="room-type" >
                                        <input type="hidden" id="hidden-room-type-id" name="room-type-id"/>
                                        <div class="dropdown-list" id="dropdown-list-room-type">
                                            <!-- Options will be populated here by JavaScript -->
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex width align-items-center">
                                    <P class="me-2 mb-0 label-text">Status:</P>
                                    <div class="dropdown">
                                        <input type="text" class="form-control dropdown-input" placeholder="Filter search..." id="dropdown-room-status" name="room-status" >
                                        <input type="hidden" id="hidden-room-status-id" name="room-status-id"/>
                                        <div class="dropdown-list" id="dropdown-list-room-status">
                                            <!-- Options will be populated here by JavaScript -->
                                        </div>
                                    </div>
                                </div>

                            </div>
                            
                            <div class="d-flex flex-row justify-content-between align-items-center gap-3" style="width: 60%;">
                                <div class="d-flex justify-content-center align-items-center"><p class="label-text" style="margin-bottom: 0!important;">Filter:</p></div>
                                <div class="d-flex width flex-row justify-content-end align-items-center gap-3">
                                    <button id="r-show-all" class="btn user btn-primary" value="all">All</button>
                                    <button id="r-show-filter"class="btn user btn-primary" value="filter">Filter</button>
                                </div>
                            </div>
                        </form>

                        <form id="class-form" class="d-flex flex-column justify-content-between align-items-start gap-3">
                            <div class="d-flex width flex-column align-items-start gap-1">
        
                                <div class="d-flex width align-items-center">
                                    <P class="me-2 mb-0 label-text">Subject Code:</P>
                                    <div class="dropdown">
                                        <input type="text" class="form-control dropdown-input" placeholder="Filter search..." id="dropdown-subject" name="subject">
                                        <input type="hidden" id="hidden-subject-id" name="subject-id"/>
                                        <div class="dropdown-list" id="dropdown-list-subject">
                                            <!-- Options will be populated here by JavaScript -->
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex width align-items-center">
                                    <P class="me-2 mb-0 label-text">Subject Type:</P>
                                    <div class="dropdown">
                                        <input type="text" class="form-control dropdown-input" placeholder="Filter search..." id="dropdown-subject-type" name="subject-type">
                                        <input type="hidden" id="hidden-subject-type" name="subject-type"/>
                                        <div class="dropdown-list" id="dropdown-list-subject-type">
                                            <!-- Options will be populated here by JavaScript -->
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex width align-items-center">
                                    <P class="me-2 mb-0 label-text">Section:</P>
                                    <div class="dropdown">
                                        <input type="text" class="form-control dropdown-input" placeholder="Filter search..." id="dropdown-section" name="section">
                                        <input type="hidden" id="hidden-section-id" name="section-id"/>
                                        <div class="dropdown-list" id="dropdown-list-section">
                                            <!-- Options will be populated here by JavaScript -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                                
                            <div class="d-flex flex-row justify-content-between align-items-center gap-3" style="width: 58%;">
                                <div class="d-flex justify-content-center align-items-center"><p class="label-text" style="margin-bottom: 0!important;">Filter:</p></div>
                                <div class="d-flex width flex-row justify-content-end align-items-center gap-3">
                                    <button type="submit" class="btn user btn-primary" value="all">All</button>
                                    <button type="submit" class="btn user btn-primary" value="filter">Filter</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    
        
                    <form class="d-flex ct3 flex-column align-items-start gap-1" id='filter-day'>
                        <div class="d-flex width align-items-center justify-content-between">
                            <label for="day" class="label-text text-center">Day:</label>
                            <select id="day" class="form-select">
                                <option value=" ">Choose...</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                            </select>
                        </div>
                    </form>
                </div> 

                <div class="card-body p-1 pt-2">
                    <div class="d-flex ct1 flex-row align-items-start gap-5">
                        <div class="input-group w-100">
                     
                        </div>
                        <?php if (hasPermission('admin') || hasPermission('staff')): ?>
                            <a id="add-room-status" href="#" class="btn btn-primary open-modal-button">Add Class Status</a>
                        <?php endif; ?>
                    </div>
                    <div class="table-responsive">
                        <table id="table-room-status" class="table table-centered table-nowrap table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Room</th>
                                    <th>Room Type</th>
                                    <th>Subject</th>
                                    <th>Subject Type</th>
                                    <th>Section</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Teacher</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                <?php
                                    $test ='Monday';
                                    $i = 1;
                                    $array = $roomObj->showAllStatus();
                                    
                                    foreach ($array as $arr) {
                                ?>
                                    <tr>
                                        <td><?= $i ?></td>
                                        <td><?= $arr['room_name'] ?></td>
                                        <td><?= $arr['room_type'] ?></td>
                                        <td><?= $arr['subject_code'] ?></td>
                                        <td><?= $arr['subject_type'] ?></td>
                                        <td><?= $arr['section_name'] ?></td>
                                        <td><?= $arr['start_time'] ?></td>
                                        <td><?= $arr['end_time'] ?></td>
                                        <td><?= $arr['faculty_name'] ?></td>
                                        <td><?= $arr['room_status'] ?></td>
                                        <td><?= $arr['remarks'] ?></td>
                                        <td class="text-nowrap">
                                            <a href="#" class="btn room-schedule" data-roomcode="<?= $arr['room_code'] ?? '' ?>" data-roomno="<?= $arr['room_no'] ?? '' ?>">Schedule</a>
                                            <?php if (hasPermission('admin') || hasPermission('staff')): ?>
                                            <a href="" class="btn room-status" data-classid="<?= $arr['class_id'] ?>" data-classday="<?= $arr['class_day'] ?>" data-subjecttype="<?= $arr['subject_type'] ?>">Occupy</a>
                                            <?php endif; ?>
                                            <?php if (hasPermission('admin')): ?>
                                                <a href="" class="btn admin edit-room-status" data-classid="<?= $arr['class_id'] ?>" data-classday="<?= $arr['class_day'] ?>" data-subjecttype="<?= $arr['subject_type'] ?>">Edit</a>
                                                <a href="" class="btn admin display-status">Display</a> <!-- hidden or displayed  -->
                                                <a href="" class="btn admin delete delete-room-status" data-classid="<?= $arr['class_id'] ?>" data-classday="<?= $arr['class_day'] ?>" data-subjecttype="<?= $arr['subject_type'] ?>">X</a>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php
                                    $i++;
                                    
                                }
                                ?>
                            </tbody>
                        </table>
                    </div> <!-- end table-responsive-->
                </div>


            </div>
        </div>
    </div>


</div>