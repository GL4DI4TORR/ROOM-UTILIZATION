let pickSemester = false;
let viewTable = false;

$(document).ready(function () { 
  //hide restricted elements
  function hideRestrictedElements() {
    try {
        const userPermissions = window.userPermissions || {};
        
        // Log permissions for debugging
        console.debug('User Permissions:', userPermissions);
        
        // Hide admin elements
        if (!userPermissions.isAdmin) {
            $('.admin').addClass('d-none');
        }
        
        // Hide staff elements
        if (!userPermissions.isStaff) {
            $('.staff').addClass('d-none');
        }
        
        // Hide elements requiring either permission
        if (!userPermissions.isAdmin && !userPermissions.isStaff) {
            $('.restricted').addClass('d-none');
        }
    } catch (error) {
        console.error('Error in hideRestrictedElements:', error);
    }
  }   

  // Initial hide
  hideRestrictedElements();
 
  // Single ajaxComplete handler
  $(document).ajaxComplete(function() {
    hideRestrictedElements();
  });

  // Alternative approach using MutationObserver
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            hideRestrictedElements();
        }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Function to close the modal
  function closeModal(modal) {
      const modalElement = modal[0]; // Get the first DOM element from the jQuery object
      modalElement.classList.remove('active'); // Remove active class
      modalElement.style.display = 'none'; // Set display to none
  }

  // Event listener for navigation links
  $(".nav-link").on("click", function (e) {
    e.preventDefault(); // Prevent default anchor click behavior
    $(".nav-link").removeClass("link-active"); // Remove active class from all links
    $(this).addClass("link-active"); // Add active class to the clicked link

    let url = $(this).attr("href"); // Get the URL from the href attribute
    window.history.pushState({ path: url }, "", url); // Update the browser's URL without reloading
  });

  $(".user-profile").on("click", function (e) {
    e.preventDefault(); // Prevent default anchor click behavior
    $(".user-profile").removeClass("link-active"); // Remove active class from all links
    $(".nav-link").removeClass("link-active");
    $(this).addClass("link-active"); // Add active class to the clicked link

    let url = $(this).attr("href"); // Get the URL from the href attribute
    window.history.pushState({ path: url }, "", url); // Update the browser's URL without reloading
  });


  //burger-sidebar Event Listener
  $("#burger").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    
     // Disable the button to prevent multiple clicks
     $(this).prop('disabled', true);

     // delay before logic
     setTimeout(function(){
         var sidebar = $("#sidebar");
         var navLabel = $(".sidebar-button-text.ms-2");
         var content = $(".content-page.px-3");
 
         if (sidebar.width() === 260) {
             sidebar.addClass("collapsed");
             navLabel.toggle();
             content.css("margin-left", "70px");
         } else {
             sidebar.removeClass("collapsed");
             navLabel.toggle();
             content.css("margin-left", "260px");
         }
 
         // Re-enable the button after the action
         $("#burger").prop('disabled', false);
     }, 300); //0.3 secs

  });

  
  //SIDE BAR NAVIGATION LINK BUTTON
  // Event listener for the roomlist-link
  $("#roomlist-link").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewroomList(); // Call the function to load analytics
  });


  // Event listener for the claslist-link
  $("#classlist-link").on("click", function (e) {
    e.preventDefault();
    
    // Check if semester is picked for this session
    $.ajax({
        url: '../fetch-data/check-semester-picked.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
          
            if (response.semesterPicked) {
                viewroomStatus();
            } else {
                semesterLoad();
            }
        },
        error: function() {
            // Fallback to semester picker on error
            semesterLoad();
        }
    });
  });

  //Event listener for the roomschedule-link
  $("#roomschedule-link").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewroomSchedule(); // Call the function to load products
  });

  $("#profile-link").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewProfile(); // Call the function to load products
  });

  $("#userlist-link").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewuserList(); // Call the function to load products
  });

  // href="room-schedule" id="roomschedule-link" 

  // Determine which page to load based on the current URL
  let url = window.location.href;
  if (url.endsWith("room-list")) {
    $("#roomlist-link").trigger("click"); // Trigger the dashboard click event
  } else if (url.endsWith("class-status")) {
    $("#classlist-link").trigger("click"); // Trigger the roomstatus click 
  } else if (url.endsWith("room-schedule")) {
    $("#roomschedule-link").trigger("click"); // Trigger the products click event
  } else if (url.endsWith("profile-page")) {
    $("#profile-link").trigger("click"); // Trigger the products click event
  } else if (url.endsWith("user-list")){
    $("#userlist-link").trigger("click");
  } else {
    $("#roomlist-link").trigger("click"); // Default to dashboard if no specific page
  }

  // Function to load analytics view
  function viewProfile() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../profile/viewProfile.php", // URL for the analytics view
      dataType: "html", // Expect HTML response
      success: function (response) {
        $(".content-page").html(response); // Load the response into the content area
         // Call function to load the chart

         $("#table-profile").DataTable({
          dom: "rtp",
          pageLength: 10,
          ordering: false
        });

        $(".edit-room").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
      
          const button = $(this); // Reference to the clicked button
          button.prop("disabled", true); // Disable the button

        });
        
      },
      error: function (xhr, status, error) {
        alert('Failed to load viewProfile.php.');
        console.error("Error loading viewProfile.php:", status, error);
      }
    });
  }


  function semesterLoad() {
    $.ajax({
      type: "GET",
      url: "../class-room-status/choose-semester.php",
      dataType: "html",
      success: function (response) {
        $(".content-page").html(response);
        
        const semesterText= $('#dropdown-semester');
        const semesterList = $('#dropdown-list-semester');
        const semesterId = $('#hidden-semester-id');
        customDropdown(semesterText, semesterList, semesterId, "../fetch-data/fetch-semesterList.php", function(data, dropdownList) {
          $.each(data, function (index, semester) {
            const dataValue = cleanInput(`${semester.semester_id}|${semester.school_year}`);
            dropdownList.append(
              $("<div>", {
                text: semester.semester_desc, // Displayed text
                'data-value': dataValue // Value attribute
              })
            );
          });
        });
        // Event handler for semester form submission
        $("#form-semester").on("submit", function (e) {
          e.preventDefault();
          // Save semester choice
          semesterPick($(this)); // Pass the form element to the function
        });
      }
    });
  }

  function semesterPick(form){
    $.ajax({
      url: '../class-room-status/save-semester.php',
      method: 'POST',
      data: form.serialize(), // Now properly serializes the form data
      dataType: 'json',
      success: function(response) {
        console.log("Response received:", response);
        if (response.status === "error") {
          if (response.semester_idErr){
            $("#dropdown-semester").addClass("is-invalid");
            $("#dropdown-semester").siblings(".invalid-feedback").text(response.semester_idErr).show();
          } else {
            $("#dropdown-semester").removeClass("is-invalid");
          }
        } else if (response.status === 'success') {
          viewroomStatus();
        }
      },
      error: function(xhr, status, error) {
        alert('Failed to save semester.');
        console.error("Error saving semester:", status, error);
      }
    });
  }
  

  // Function to load room status view
  function viewroomStatus() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../class-room-status/viewclass-status.php", // URL for the analytics view
      dataType: "html", // Expect HTML response
      success: function (response) {
        $(".content-page").html(response); // Load the response into the content area
        // Initialize DataTable for class details first
       var tableSubjects = $("#table-subject-details").DataTable({
  dom: "rtp",
  pageLength: 10,
  ordering: false,
  drawCallback: function() {
    // Bind edit button
    $(".edit-subject").off('click').on("click", function(e) {
      e.preventDefault();
      const button = $(this);
      button.prop("disabled", true);
      
      const subjectCode = $(this).data('subjectcode');
      
      editSubject(subjectCode).always(function() {
        button.prop("disabled", false);
      });
    });

    // Bind delete button
    $(".delete-subject").off('click').on("click", function(e) {
      e.preventDefault();
      const button = $(this);
      button.prop("disabled", true);
      
      const subjectCode = $(this).data('subjectcode');

      deleteSubject(subjectCode).always(function() {
        button.prop("disabled", false);
      });
    });
  }
});

// Bind the search event for subjects
$("#search-subject").on("keyup", function () {
  console.log("Subject search triggered", this.value);
  tableSubjects.search(this.value).draw();
});

// Filter by prospectus year (optional - requires AJAX to reload data)
$("#prospectus").on("change", function() {
  // For now, just reload the page - you can make this more dynamic with AJAX
  viewroomStatus();
});

        // Get the select element
        const selectDay = document.getElementById("day");
        
        // Function to set the current day in the dropdown, real-time
        // Function to set the current day in the dropdown, real-time
        function setCurrentDay() {
          const options = ["Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const currentDayIndex = new Date().getDay();  //
          const currentDay = options[currentDayIndex]; // Get current day name

          // Set the dropdown value to the current day
          selectDay.value = currentDay;
          fetchDayData(); // Fetch data for the current day
        }

        function fetchDayData(){
          const selectedDay = selectDay.value;
          

          // Make an AJAX call to fetch data based on the selected day
          $.ajax({
              type: "POST", // Use POST request
              url: "../fetch-data/fetch-scheduled-classday.php", // URL to your PHP script that handles the request
              data: { selected_day: selectedDay }, // Send selected day as data
              // dataType: 'json',
              success: function(response) {
                console.log("Selected option:", selectedDay);

                  // Update the table body with the fetched data
                  $("#table-room-status tbody").html(response);
                
              },
              error: function(xhr, status, error) {
                  console.error("Error fetching data:", error);
              }
          });
        }

        //Custom Dropdown ROOM FORM
        const roomText = $('#dropdown-room-name');
        const roomId = $('#hidden-room-id');
        const roomList = $('#dropdown-list-room-name');
        customDropdown(roomText, roomList, roomId, "../fetch-data/fetch-room-name.php", function(data, dropdownList) {
          $.each(data, function(index, room) {
              dropdownList.append(
                  $("<div>", {
                      text: room.room_name, // Displayed text
                      'data-value': `${room.room_code}|${room.room_no}` // Value attribute
                  })
              );
          });
        });

  
        const rtypeText = $('#dropdown-room-type');
        const rtypeId = $('#hidden-room-type-id');
        const rtypeList = $('#dropdown-list-room-type');
        customDropdown(rtypeText, rtypeList, rtypeId, "../fetch-data/fetch-roomtype.php", function(data, dropdownList) {
          $.each(data, function(index, rtype) {
              dropdownList.append(
                  $("<div>", {
                      text: rtype.rtype_desc, // Displayed text
                      'data-value': rtype.type_id // Value attribute
                  })
              );
          });
        });

        const roomstatusText= $('#dropdown-room-status');
        const roomstatusList = $('#dropdown-list-room-status');
        const roomstatusId = $('#hidden-room-status-id');
        customDropdown(roomstatusText, roomstatusList, roomstatusId, "../fetch-data/fetch-subject.php", function(data, dropdownList) {
          var statusArr = ['OCCUPIED', 'AVAILABLE'];
          
          $.each(statusArr, function (index, roomstatus) {
            dropdownList.append(
              $("<div>", {
                text:roomstatus, // Displayed text
                  'data-value': roomstatus // Value attribute
              })
            );
          });
        });

        //Custom Dropdown CLASS FORM
        const subjectText= $('#dropdown-subject');
        const subjectList = $('#dropdown-list-subject');
        const subjectId = $('#hidden-subject-id');
        customDropdown(subjectText, subjectList, subjectId, "../fetch-data/fetch-subject.php", function(data, dropdownList) {
          $.each(data, function (index, subject) {
            dropdownList.append(
              $("<div>", {
                text:subject.subject_id, // Displayed text
                  'data-value': subject.subject_id // Value attribute
              })
            );
          });
        });

        const subtypeText= $('#dropdown-subject-type');
        const subtypeList = $('#dropdown-list-subject-type');
        const subtypeId = $('#hidden-subject-type');
        customDropdown(subtypeText, subtypeList, subtypeId, "../fetch-data/fetch-subject.php", function(data, dropdownList) {
          var subtypeArr = ['LEC', 'LAB'];
          
          $.each(subtypeArr, function (index, subtype) {
            dropdownList.append(
              $("<div>", {
                text:subtype, // Displayed text
                  'data-value': subtype // Value attribute
              })
            );
          });
        });

        const sectionText= $('#dropdown-section');
        const sectionList = $('#dropdown-list-section');
        const sectionId = $('#hidden-section-id');
        customDropdown(sectionText, sectionList, sectionId, "../fetch-data/fetch-section.php", function(data, dropdownList) {
          $.each(data, function (index, section) {
            const displayContent = cleanInput(`${section.course_abbr}${section.year_level}${section.section}`);
            dropdownList.append(
              $("<div>", {
                text: displayContent, // Displayed text
                'data-value': `${section.course_abbr}|${section.year_level}|${section.section}` // Value attribute
              })
            );
          });
        });

        //EVENT LISTENER FOR CLASS DETAILS//---start
        //call function to load modal form add class details
        
        //add class details
        $("#add-class-details").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          addclassDetails();
        });

        //end ---

       //ADD SUBJECT DETAILS
       $("#add-subject-details").on("click", function (e) {
  e.preventDefault();
  addsubjectDetails();
});

         // Call function to load modal form class status
        $("#add-room-status").on("click", function (e) {
           e.preventDefault(); // Prevent default behavior
          addroomStatus(); // Call function to add status
        });

        
        // var table = $("#table-room-status").DataTable({
        //   dom: "rtp",
        //   pageLength: 10,
        //   ordering: false
        // });

        $('#table-room-status').on('click', '.room-schedule, .room-status, .edit-room-status, .display-status, .delete-room-status', function(e) {
          e.preventDefault();
          const button = $(this);
          button.prop("disabled", true);
          
          $(".edit-room-status").off('click').on("click", function(e){
            e.preventDefault();
            const button = $(this);
            button.prop("disabled", true);

            const classId = $(this).data('classid');
            const subType = $(this).data('subjecttype');
            const classDay = $(this).data('classday');

            editroomStatus(classId, subType, classDay).always(function(){
              button.prop("disabled", false);
            });
          });

          $(".room-schedule").on("click", function(e){
            e.preventDefault();
            const button = $(this);
            button.prop("disabled", true);

          });

          $(".room-status").on("click", function(e){
            e.preventDefault();
            const button = $(this);
            button.prop("disabled", true);
          });

          $(".display-status").on("click", function(e){
            e.preventDefault();
            const button = $(this);
            button.prop("disabled", true);
          });

          $(".delete-room-status").on("click", function(e){
            e.preventDefault();
            const button = $(this);
            button.prop("disabled", true);

            const classId = $(this).data('classid');
            const subType = $(this).data('subjecttype');
            const classDay = $(this).data('classday');

            deleteconfirmationStatus(classId, subType, classDay).always(function(){
              button.prop("disabled", false);
            });
          });
        });

        function initializeDataTable() {
          if ($.fn.DataTable.isDataTable('#table-room-status')) {
              $('#table-room-status').DataTable().destroy();
          }
          
          selectDay.addEventListener("change", fetchDayData);

          var table = $("#table-room-status").DataTable({
            dom: "rtp",
            pageLength: 10,
            ordering: false,
          });
          
           // Room form filter handler
          $("#room-form").off('submit').on("submit", function (e) {
            e.preventDefault();
  
            const roomName = $('#dropdown-room-name').val();
            const roomType = $('#dropdown-room-type').val();
            const status = $('#dropdown-room-status').val();
            const action = e.originalEvent.submitter.value;
            const currentDay = selectDay.value;
  
            console.log("Room form filtering for day:", currentDay);
  
            // Clear previous filters
            table.search('').columns().search('').draw();
  
            if (action === "filter") {
                // Apply room filters
                if (roomName && roomName !== "choose") {
                    table.column(1).search(roomName);
                }
                if (roomType && roomType !== "choose") {
                    table.column(2).search(roomType);
                }
                if (status && status !== "choose") {
                    table.column(9).search(status);
                }
                table.draw();
            } else if (action === "all") {
                fetchDayData();
            }
          });
  
          // Class form filter handler
          $("#class-form").off('submit').on("submit", function (e) {
            e.preventDefault();
            
            // const subjectCode = $('#subject-code-filter').val();
            const subjectCode = $('#dropdown-subject').val();
            const subjectType = $('#dropdown-subject-type').val();
            const section = $('#dropdown-section').val();
            const action = e.originalEvent.submitter.value;
            const currentDay = selectDay.value;
  
            console.log("Class form filtering for day:", currentDay);
  
            // Clear previous filters
            table.search('').columns().search('').draw();
  
            if (action === "filter") {
                // Apply class filters
                if (subjectCode && subjectCode !== "choose") {
                    table.column(3).search(subjectCode);
                }
                if (subjectType && subjectType !== "choose") {
                    table.column(4).search(subjectType);
                }
                if (section && section !== "choose") {
                    table.column(5).search(section);
                }
                table.draw();
            } else if (action === "all") {
                fetchDayData();
            }
          });
        
        }

        // initialize
        setCurrentDay();
        selectDay.addEventListener("change", fetchDayData);
        initializeDataTable();
      },
    });
  }


  //Function to load room schedule view, load content
  //edit here
  function viewroomSchedule() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../room-schedule/viewroom-schedule.php", // URL for the analytics view
      dataType: "html", // Expect HTML response
      success: function (response) {
        $(".content-page").html(response); // Load the response into the content are
        
        // Prepare helper maps for the time grid
        const dayIndex = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
        const timeRowMap = {};
        $("#table-room-schedule tbody tr").each(function(){
          const timeLabel = $(this).find("td:first").text().trim();
          timeRowMap[timeLabel] = $(this);
        });

        function clearScheduleCells(){
          $("#table-room-schedule tbody tr").each(function(){
            $(this).find("td:not(:first)").removeClass("bg-info text-white").empty();
          });
        }

        function toMinutes(sqlTime){
          // expects HH:MM:SS
          if(!sqlTime) return null;
          const parts = sqlTime.split(":").map(Number);
          return (parts[0]*60) + parts[1];
        }

        function labelFromMinutes(mins){
          const hours24 = Math.floor(mins / 60);
          const minutes = mins % 60;
          const ampm = hours24 >= 12 ? "PM" : "AM";
          const hours12 = ((hours24 + 11) % 12) + 1;
          const padded = minutes.toString().padStart(2,"0");
          return `${hours12}:${padded} ${ampm}`;
        }

        function renderSchedule(data){
          clearScheduleCells();
          if (!Array.isArray(data)) return;
          data.forEach(item => {
            const start = toMinutes(item.start_time);
            const end = toMinutes(item.end_time);
            const colIndex = dayIndex[item.class_day] || 0;
            if (start === null || end === null || !colIndex) return;
            for(let m = start; m < end; m += 30){
              const label = labelFromMinutes(m);
              const row = timeRowMap[label];
              if(!row) continue;
              const cell = row.find(`td:eq(${colIndex})`);
              if(!cell.length) continue;
              const text = `${item.subject_code || ''} ${item.section_name || ''}<br>${item.teacher_name || ''}`;
              cell.addClass("bg-info text-white").html(text.trim());
            }
          });
        }

        function fetchSchedule(){
          const roomVal = $("#schedule-room").val();
          const dayVal = $("#schedule-day").val();
          if (!roomVal){ alert('Please select a room.'); return; }
          $.ajax({
            url: "../fetch-data/fetch-schedule.php",
            data: { room: roomVal, day: dayVal },
            dataType: "json",
            success: function(resp){
              if (resp.status === "success"){
                renderSchedule(resp.data);
              } else {
                alert(resp.generalErr || 'Failed to load schedule.');
              }
            },
            error: function(){
              alert('Failed to load schedule.');
            }
          });
        }

        // Populate room dropdown
        $.ajax({
          url: "../fetch-data/fetch-room-name.php",
          dataType: "json",
          success: function(data){
            const sel = $("#schedule-room");
            sel.empty().append('<option value="">Select Room</option>');
            $.each(data, function(_, room){
              const val = `${room.room_code}|${room.room_no}`;
              sel.append(`<option value="${val}">${room.room_name}</option>`);
            });
          }
        });

        // Buttons
        $("#schedule-back").on("click", function(){ history.back(); });
        $("#schedule-continue").on("click", function(e){
          e.preventDefault();
          fetchSchedule();
        });

      },
    });
  }

  // Function to load analytics view
  function viewuserList() {
    $.ajax({
      type: "GET", // Use GET request
      url: "viewuser-list.php", // URL for the analytics view
      dataType: "html", // Expect HTML response
      success: function (response) {
        $(".content-page").html(response); // Load the response into the content area
         // Call function to load the chart

        var table = $("#table-user-list").DataTable({
          dom: "rtp",
          pageLength: 10,
          ordering: false
        });
        
        // Bind search box to DataTable search
        $("#search-subject").on("input keyup change", function () {
          table.search(this.value).draw();
        });
        $("#search-btn").on("click", function(){
          table.search($("#search-subject").val()).draw();
        });

        $("#add-user").on("click", function (e) {
          e.preventDefault();
          addUser();
        });


        $(".edit-user").on("click", function (e) {
          e.preventDefault();
          const payload = {
            user_id: $(this).data('user_id'),
            username: $(this).data('username'),
            is_admin: $(this).data('is_admin'),
            is_staff: $(this).data('is_staff')
          };
          editUserModal(payload);
        });

        $(".delete-user").on("click", function (e) {
          e.preventDefault();
          const userId = $(this).data('user_id');
          deleteUser(userId);
        });
        
      },
    });
  }

  function addUser(){
    $.ajax({
      type: "GET",
      url: "../admin/add-user.html?v=" + new Date().getTime(),
      dataType: "html",
      success: function(view){
        $(".modal-container").html(view);
        $("#staticBackdrop").modal("show");
        const modal = $('#staticBackdrop');
        $(".modal-close").on("click", function (e) { e.preventDefault(); closeModal(modal); });
        $("#form-add-user").on("submit", function(e){ e.preventDefault(); saveUser(); });
      }
    });
  }

  function saveUser(){
    $.ajax({
      type: "POST",
      url: "../admin/save-user.php",
      data: $("#form-add-user").serialize(),
      dataType: "json",
      success: function(response){
        if (response.status === "error"){
          if (response.generalErr){ $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr)); } else { $("#general-error").addClass("d-none"); }
          [
            {id: '#user-id', err: response.user_idErr},
            {id: '#username', err: response.usernameErr}
          ].forEach(function(field){
            if (field.err){ $(field.id).addClass("is-invalid").siblings(".invalid-feedback").text(field.err).show(); } else { $(field.id).removeClass("is-invalid"); }
          });
        } else if (response.status === "success"){ $("#staticBackdrop").modal("hide"); viewuserList(); }
      },
      error: function(){ alert('Failed to save user.'); }
    });
  }

  function editUserModal(data){
    $.ajax({
      type: "GET",
      url: "../admin/edit-user.html?v=" + new Date().getTime(),
      dataType: "html",
      success: function(view){
        $(".modal-container").html(view);
        $("#staticBackdrop").modal("show");
        const modal = $('#staticBackdrop');
        $('#user-id').val(data.user_id);
        $('#username').val(data.username);
        $('#is-admin').val(data.is_admin);
        $('#is-staff').val(data.is_staff);
        $(".modal-close").on("click", function (e) { e.preventDefault(); closeModal(modal); });
        $("#form-edit-user").on("submit", function(e){ e.preventDefault(); updateUser(); });
      }
    });
  }

  function updateUser(){
    $.ajax({
      type: "POST",
      url: "../admin/update-user.php",
      data: $("#form-edit-user").serialize(),
      dataType: "json",
      success: function(response){
        if (response.status === "error"){
          if (response.generalErr){ $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr)); } else { $("#general-error").addClass("d-none"); }
        } else if (response.status === "success"){ $("#staticBackdrop").modal("hide"); viewuserList(); }
      },
      error: function(){ alert('Failed to update user.'); }
    });
  }

  function deleteUser(userId){
    if (!confirm('Delete this user registration?')){ return; }
    $.ajax({
      type: "POST",
      url: "../admin/delete-user.php",
      data: { 'user-id': userId },
      dataType: "json",
      success: function(response){ if (response.status === 'success'){ viewuserList(); } else { alert(response.generalErr || 'Delete failed'); } },
      error: function(){ alert('Failed to delete user.'); }
    });
  }


  // Function to load analytics view
  function viewroomList() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../room-list/viewroomlist.php", // URL for the analytics view
      dataType: "html", // Expect HTML response
      success: function (response) {
        $(".content-page").html(response); // Load the response into the content area
         // Call function to load the chart

        var table = $("#table-room-list").DataTable({
          dom: "rtp",
          pageLength: 10,
          ordering: false
        });
        
        // Bind custom input to DataTable search
        $("#custom-search").on("keyup", function () {
          table.search(this.value).draw(); // Search room based on input
        });
        
        // //Custom Dropdown ROOM FORM
        // const roomText = $('#dropdown-room-name');
        // const roomId = $('#hidden-room-id');
        // const roomList = $('#dropdown-list-room-name');
        // customDropdown(roomText, roomList, roomId, "../fetch-data/fetch-room-name.php", function(data, dropdownList) {
        //   $.each(data, function(index, room) {
        //       dropdownList.append(
        //           $('<div>', {
        //               text: room.room_name, // Displayed text
        //               'data-value': `${room.room_code}|${room.room_no}` // Value attribute
        //           })
        //       );
        //   });
        // });

        // const rtypeText = $('#dropdown-room-type');
        // const rtypeId = $('#hidden-room-type-id');
        // const rtypeList = $('#dropdown-list-room-type');
        // customDropdown(rtypeText, rtypeList, rtypeId, "../fetch-data/fetch-roomtype.php", function(data, dropdownList) {
        //   $.each(data, function(index, rtype) {
        //       dropdownList.append(
        //           $('<div>', {
        //               text: rtype.room_type_desc, // Displayed text
        //               'data-value': rtype.type_id // Value attribute
        //           })
        //       );
        //   });
        // });

        // // Bind change event for room name filter
        // $("#dropdown-room-name").on("input click change", function () {
        // // $("#roomname-filter").on("change", function () {
        //   if(this.value !== "") {
        //     table.column(1).search(this.value).draw(); // Filter by room name (column 1)
        //   } else {
        //     // Clear the filter for the room name column if "choose" is selected
        //     table.column(1).search('').draw();
        //   }
        // });
        
        // // Bind change event for room type filter
        // $("#dropdown-room-type").on("input click change", function () {
        //   if (this.value !== "") {
        //     table.column(2).search(this.value).draw(); // Filter by room type (column 2)
        //   } else {
        //     // Clear the filter for the room type column if "choose" is selected
        //     table.column(2).search('').draw();
        //   }
        // });

        // Bind custom input to DataTable search
        $("#custom-search").on("keyup", function () {
          table.search(this.value).draw(); // Search room based on input
        });

        $("#add-room").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          addRoom(); // Call function to add product
        });

        $(".room-status").on("click", function (e) {
          e.preventDefault();
          viewroomStatus();
        });

        $(".room-schedule").on("click", function (e) {
          e.preventDefault();
          viewroomSchedule();
        });

        $(".edit-room").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
      
          const button = $(this); // Reference to the clicked button
          button.prop("disabled", true); // Disable the button
          
          const roomCode = $(this).data('roomcode');
          const roomNo = $(this).data('roomno');

           // Call the AJAX function
          // editRoom(this.dataset.id);

          // Call the AJAX function
          editRoom(roomCode, roomNo).always(function() {
            button.prop("disabled", false); // Re-enable the button after AJAX completes
          });


        });
        
      },
    });
  }

function addsubjectDetails() {
    $.ajax({
      type: "GET",
      url: "../class-room-status/add-subject-details.html?v=" + new Date().getTime(),
      dataType: "html",
      success: function (view) {
        $(".modal-container").html(view);
        console.log("Modal content loaded successfully.");
        $("#staticBackdrop").modal("show");
        
        const modal = $('#staticBackdrop');

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal);
        }); 

        // Event listener for the add subject form submission
        $("#form-add").on("submit", function (e) {
          e.preventDefault();
          saveSubjectDetails();
        });
        
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
}

function saveSubjectDetails(){
    const formData = $("#form-add").serialize();
    console.log("Sending data:", formData);
    
    $.ajax({
      type: "POST",
      url: "../class-room-status/save-subject-detail.php",
      data: formData,
      dataType: "json",
      success: function (response) {
        console.log("Response received:", response);
        if (response.status === "error") {
          // Clear previous errors
          $(".is-invalid").removeClass("is-invalid");
          $(".invalid-feedback").hide();
          
          if (response.generalErr){
            $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr));
          } else {
            $("#general-error").addClass("d-none");
          }
          
          if (response.subject_codeErr){
            $("#subject-code").addClass("is-invalid");
            $("#subject-code").siblings(".invalid-feedback").text(response.subject_codeErr).show();
          }
          
          if (response.descriptionErr){
            $("#description").addClass("is-invalid");
            $("#description").siblings(".invalid-feedback").text(response.descriptionErr).show();
          }
          
          if (response.lab_unitsErr){
            $("#lab-units").addClass("is-invalid");
            $("#lab-units").siblings(".invalid-feedback").text(response.lab_unitsErr).show();
          }
          
          if (response.lec_unitsErr){
            $("#lec-units").addClass("is-invalid");
            $("#lec-units").siblings(".invalid-feedback").text(response.lec_unitsErr).show();
          }
        
        } else if (response.status === "success") {
          $("#staticBackdrop").modal("hide");
          $("#form-add")[0].reset();
          alert('Subject added successfully!');
          viewroomStatus();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to save subject details.');
        console.error("Error saving subject:", status, error);
      }
    });
}


  //Function for ROOM LIST, MODAL AJAX
  // Function to show the add product modal
  function editRoom(roomCode, roomNo) {
    return $.ajax({
      type: "GET", // Use GET request
      url: "../room-list/edit.php?v=" + new Date().getTime(), // URL to get product data
      dataType: "html", // Expect JSON response
      success: function (view) {
        // Assuming 'view' contains the new content you want to display
        $(".modal-container").empty().html(view); // Load the modal view
        $("#staticBackdrop").modal("show"); // Show the modal
        $("#staticBackdroped").attr("data-id", roomCode, roomNo);

        const modal = $('#staticBackdrop');

          //function to fetch record list of room
        $.ajax({
          url: `../fetch-data/fetch-room.php?roomCode=${roomCode}&roomNo=${roomNo}`, //2 parameters separated by &
          dataType: "json",
          success: function(data) {
              console.log('Fetched data:', data);
              /* REMOVED, original inputs taken from URL
              //// $('#original-room-name').val(data.room_name);
              //// $('#original-room-type-id').val(data.room_code);
              */
              $('#room-name').val(data.room_name);
              $('#dropdown-room-type').val(data.room_type);
              $('#hidden-room-type-id').val(data.room_code);

          },
          error: function(xhr, status, error) {
              console.error("Error fetching room record:", error);
          }
        });


        const rtypeText = $('#dropdown-room-type');
        const rtypeId = $('#hidden-room-type-id');
        const rtypeList = $('#dropdown-list-room-type');
        customDropdown(rtypeText, rtypeList, rtypeId, "../fetch-data/fetch-roomtype.php", function(data, dropdownList) {
          $.each(data, function(index, rtype) {
              dropdownList.append(
                  $('<div>', {
                      text: rtype.room_type_desc, // Displayed text
                      'data-value': rtype.room_type_id // Value attribute
                  })
              );
          });
        });

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add product form submission
        $("#form-edit-room").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          updateRoom(roomCode, roomNo); // Call function to save product
        });
      },
    });
  }

  //updateRoom
  function updateRoom(roomCode, roomNo) {
    $.ajax({
      type: "POST", // Use POST request
      url: `../room-list/update-room.php?roomCode=${roomCode}&roomNo=${roomNo}`, // URL for saving room
      data: $("form").serialize(), // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "error") {
          // Handle validation errors
          if (response.generalErr){
            $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr));
          } else {
            $("#general-error").addClass("d-none");
          }

          if (response.room_nameErr) {
            $("#room-name").addClass("is-invalid"); // Mark field as invalid
            $("#room-name").siblings(".invalid-feedback").text(response.room_nameErr).show(); // Show error message
          } else {
            $("#room-name").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
          if (response.room_typeErr) {
            $("#dropdown-room-type").addClass("is-invalid");
            $("#dropdown-room-type")
              .siblings(".invalid-feedback")
              .text(response.room_typeErr)
              .show();
          } else {
            $("#dropdown-room-type").removeClass("is-invalid");
          }
          
        } else if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("form")[0].reset(); // Reset the form
          // Optionally, reload products to show new entry
          viewroomList();
        }
      },
    });
  }

  //function to show the add room modal
  function addRoom() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../room-list/add.html?v=" + new Date().getTime(), // URL for add product view
      dataType: "html", // Expect HTML response
      success: function (view) {
        $(".modal-container").html(view); // Load the modal view
        $("#staticBackdrop").modal("show"); // Show the modal

        const modal = $('#staticBackdrop');

        // fetchroomType(); // Load room type for the select input
        const rtypeText = $('#dropdown-room-type');
        const rtypeId = $('#hidden-room-type-id');
        const rtypeList = $('#dropdown-list-room-type');
        customDropdown(rtypeText, rtypeList, rtypeId, "../fetch-data/fetch-roomtype.php", function(data, dropdownList) {
          $.each(data, function(index, rtype) {
              dropdownList.append(
                  $('<div>', {
                      text: rtype.room_type_desc, // Displayed text
                      'data-value': rtype.type_id // Value attribute
                  })
              );
          });
        });


        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add product form submission
        $("#form-add-room").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          saveRoom(); // Call function to save product
        });
      },
    });
  }

  // Function to save a new room
  function saveRoom(){
    $.ajax({
      type: "POST", // Use POST request
      url: "../room-list/save-room.php", // URL for saving room
      data: $("form").serialize(), // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "error") {
          // Handle validation errors
          if (response.generalErr){
            $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr));
          } else {
            $("#general-error").addClass("d-none");
          }

          if (response.room_nameErr){
            $("#room-name").addClass("is-invalid"); // Mark field as invalid
            $("#room-name").siblings(".invalid-feedback").text(response.room_nameErr).show(); // Show error message
          } else {
            $("#room-name").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
          if (response.room_typeErr){
            $("#dropdown-room-type").addClass("is-invalid"); // Mark field as invalid
            $("#dropdown-room-type").siblings(".invalid-feedback").text(response.room_typeErr).show(); // Show error message
          } else {
            $("#dropdown-room-type").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
        } else if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("form")[0].reset(); // Reset the form
          // Optionally, reload roomlist to show new entry
          viewroomList();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to load save room.php.');
        console.error("Error saving php room:", status, error);
      }

    });
  }

  //Function for class details, MODAL AJAX
  //add room status
  function addclassDetails() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../class-room-status/add-class-detail.html?v=" + new Date().getTime(), // URL for add product view
      dataType: "html", // Expect HTML response
      success: function (view) {
        $(".modal-container").html(view); // Load the modal view
        console.log("Modal content loaded successfully.");
        $("#staticBackdrop").modal("show");
        const modal = $('#staticBackdrop');
        
        const subjectText= $('#dropdown-subject');
        const subjectList = $('#dropdown-list-subject');
        const subjectId = $('#hidden-subject-id');
        customDropdown(subjectText, subjectList, subjectId, "../fetch-data/fetch-subject.php", function(data, dropdownList) {
          $.each(data, function (index, subject) {
            const displayContent = cleanInput(subject.subject_name || subject.subject_id);
            dropdownList.append(
              $("<div>", {
                text: displayContent, // human readable
                'data-value': subject.subject_id // ID value
              })
            );
          });
        });

        const sectionText= $('#dropdown-section');
        const sectionList = $('#dropdown-list-section');
        const sectionId = $('#hidden-section-id');
        // fetchSection();//fetchsection
        // allow free text if not in dropdown: keep hidden id empty when custom text is used
        customDropdown(sectionText, sectionList, sectionId, "../fetch-data/fetch-section.php", function(data, dropdownList) {
          $.each(data, function (index, section) {
            const displayContent = cleanInput(`${section.course_abbr}${section.year_level}${section.section}`);
            dropdownList.append(
              $("<div>", {
                text: displayContent, // Displayed text
                'data-value': `${section.course_abbr}|${section.year_level}|${section.section}` // Value attribute
              })
            );
          });
        });
        // clear hidden id if user types their own section
        sectionText.on('input', function(){
          sectionId.val('');
        });

        const teacherText= $('#dropdown-teacher');
        const teacherList = $('#dropdown-list-teacher');
        const teacherId = $('#hidden-teacher-assigned');
        customDropdown(teacherText, teacherList, teacherId, "../fetch-data/fetch-teacher.php", function(data, dropdownList) {
          $.each(data, function (index, teacher) {
            dropdownList.append(
              $("<div>", {
                text: teacher.teacher_name, // Displayed text
                'data-value': teacher.faculty_id // Value attribute
              })
            );
          });
        });

        const teacherTextLab= $('#dropdown-teacher-lab');
        const teacherListLab = $('#dropdown-list-teacher-lab');
        const teacherIdLab = $('#hidden-teacher-assigned-lab');
        customDropdown(teacherTextLab, teacherListLab, teacherIdLab, "../fetch-data/fetch-teacher.php", function(data, dropdownList) {
          $.each(data, function (index, teacher) {
            dropdownList.append(
              $("<div>", {
                text: teacher.teacher_name, // Displayed text
                'data-value': teacher.faculty_id // Value attribute
              })
            );
          });
        });

        // Fix: Update checkbox event handler
        $('input[name="subject-type[]"]').on("change", function() {
          // Count checked checkboxes
          const checkedCount = $('input[name="subject-type[]"]:checked').length;
          // Show div-teacher if both checkboxes are checked
          if (checkedCount === 2) {
            $('#div-teacher').show();
            $('#hidden-teacher-assigned-lab').prop('disabled', false);
            $('#determiner').val('true');
          } else {
            $('#div-teacher').hide();
            $('#hidden-teacher-assigned-lab').prop('disabled', true);
            $('#determiner').val('false');
          }
      
        });

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add product form submission
        $("#form-add").on("submit", function (e) {
        e.preventDefault();
       saveclassDetails(); // Call function to save product
        });
        
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
  }

     

  //Function for class details, php handling
  //save class details
  function saveclassDetails(){
    // Debug what's being sent
    const formClassDetails = $("#form-add").serialize();
    console.log("Sending data:", formClassDetails);
    
    $.ajax({
      type: "POST", // Use POST request
      url: "../class-room-status/save-class-detail.php", // URL for saving room
      data: formClassDetails, // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        console.log("Response received:", response);
        if (response.status === "error") {
          // Handle validation errors 
          if (response.generalErr){
            $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr));
          } else {
            $("#general-error").addClass("d-none");
          }
          
          if (response.class_idErr){
            $("#class-id").addClass("is-invalid");
            $("#class-id").siblings(".invalid-feedback").text(response.class_idErr).show();
            $("#example-class").show();
            $("#example-class").addClass("text-danger");
          } else {
            $("#class-id").removeClass("is-invalid");
            $("#example-class").removeClass("text-danger");
            $("#example-class").hide();
          }

          if (response.subject_idErr){
            $("#dropdown-subject").addClass("is-invalid");
            $("#dropdown-subject").siblings(".invalid-feedback").text(response.subject_idErr).show();
          } else {
            $("#dropdown-subject").removeClass("is-invalid");
          }

          if(response.subject_typeErr){
            $(".subject-type").addClass("is-invalid");
            $(".subject-type").siblings(".invalid-feedback").html(cleanInput(response.subject_typeErr)).show();
          } else {
            $(".subject-type").removeClass("is-invalid");
          }

          if (response.section_idErr){
            $("#dropdown-section").addClass("is-invalid");
            $("#dropdown-section").siblings(".invalid-feedback").text(response.section_idErr).show();
          } else {
            $("#dropdown-section").removeClass("is-invalid");
          }

          if (response.teacher_assignedErr){
            $("#dropdown-teacher").addClass("is-invalid");
            $("#dropdown-teacher").siblings(".invalid-feedback").text(response.teacher_assignedErr).show();
          } else {
            $("#dropdown-teacher").removeClass("is-invalid");
          }

          if (response.teacher_assigned_labErr){
            $("#dropdown-teacher-lab").addClass("is-invalid");
            $("#dropdown-teacher-lab").siblings(".invalid-feedback").text(response.teacher_assigned_labErr).show();
          } else {
            $("#dropdown-teacher-lab").removeClass("is-invalid");
          }
        
        } else if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("#form-add")[0].reset(); // Reset the form
          // Optionally, reload page to show new entry
          viewroomStatus();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to load save-room-status.php.');
        console.error("Error saving php room status:", status, error);
      }

    });
  }

  function editclassDetails(classId, subType) {
    // Split the composite ID into its parts
      return $.ajax({
        type: "GET", // Use GET request
        url: "../class-room-status/edit-class-detail.html?v=" + new Date().getTime(), // URL 
        dataType: "html", // Expect JSON response
        success: function (view) {
          // Assuming 'view' contains the new content you want to display
          $(".modal-container").empty().html(view); // Load the modal view
          $("#staticBackdrop").modal("show"); // Show the modal
          $("#staticBackdroped").attr("data-id", classId, subType);

          const modal =  $('#staticBackdrop');
              
          // Then fetch and populate the data
          $.ajax({
              url: `../fetch-data/fetch-class-detail.php?classId=${classId}&subType=${subType}`, //2 parameters separated by &
              dataType: "json",
              success: function(data) {
                  console.log('Fetched data:', data);
                  

                  $('#original-class-id').val(data.class_id);
                  $('#class-id').val(data.class_id);

                  $('#original-subject-id').val(data.subject_id);
                  $('#dropdown-subject').val(`${data.subject_id}---LC|LAB---${data.subject_units}`);
                  $('#hidden-subject-id').val(data.subject_id);
                  
                  $('#original-subtype-id').val(data.subtype_id);
                  $('input[name="subject-type"][value="' + data.subtype_id + '"]').prop('checked', true);
                  
                  $('#original-section-id').val(data.section_id);
                  $('#dropdown-section').val(data.section_name);
                  $('#hidden-section-id').val(data.section_id);

                  $('#dropdown-teacher').val(data.teacher_name);
                  $('#hidden-teacher-assigned').val(data.teacher_id);

              },
              error: function(xhr, status, error) {
                  console.error("Error fetching status record:", error);
              }
          });

          const subjectText= $('#dropdown-subject');
          const subjectList = $('#dropdown-list-subject');
          const subjectId = $('#hidden-subject-id');
          // fetchSubject();//fetchsubject
          customDropdown(subjectText, subjectList, subjectId, "../fetch-data/fetch-subject.php", function(data, dropdownList) {
            $.each(data, function (index, subject) {
              const displayContent = cleanInput(`${subject.subject_id}---LC|LAB---${subject.subject_units}`);
              dropdownList.append(
                $("<div>", {
                  text:displayContent, // Displayed text
                    'data-value': subject.subject_id // Value attribute
                })
              );
            });
          });

          const sectionText= $('#dropdown-section');
          const sectionList = $('#dropdown-list-section');
          const sectionId = $('#hidden-section-id');
          // fetchSection();//fetchsection
          customDropdown(sectionText, sectionList, sectionId, "../fetch-data/fetch-section.php", function(data, dropdownList) {
            $.each(data, function (index, section) {
              const displayContent = cleanInput(`${section.course_abbr}${section.year_level}${section.section}`);
              dropdownList.append(
                $("<div>", {
                  text: displayContent, // Displayed text
                  'data-value': `${section.course_abbr}|${section.year_level}|${section.section}` // Value attribute
                })
              );
            });
          });

          const teacherText= $('#dropdown-teacher');
          const teacherList = $('#dropdown-list-teacher');
          const teacherId = $('#hidden-teacher-assigned');
          customDropdown(teacherText, teacherList, teacherId, "../fetch-data/fetch-teacher.php", function(data, dropdownList) {
            $.each(data, function (index, teacher) {
              dropdownList.append(
                $("<div>", {
                  text: teacher.teacher_name, // Displayed text
                  'data-value': teacher.faculty_id // Value attribute
                })
              );
            });
          });
          
          $(".modal-close").on("click", function (e) {
              e.preventDefault();
              closeModal(modal);
          }); 

          $("#form-edit").on("submit", function (e) {
              e.preventDefault();
              updateclassDetails();
          });
        },
        error: function (xhr, status, error) {
            alert("An error occurred while loading the modal: " + error);
        }
    });
  }

  function updateclassDetails(){
    // Debug what's being sent
    const formClassDetails = $("#form-edit").serialize();
    console.log("Sending data:", formClassDetails);
    
    $.ajax({
      type: "POST", // Use POST request
      url: "../class-room-status/update-class-detail.php", // URL for saving room
      data: formClassDetails, // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        console.log("Response received:", response);
        if (response.status === "error") {
          // Handle validation errors
          //Check if class id is already existing
          if (response.generalErr){
            $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr));
          } else {
            $("#general-error").addClass("d-none");
          }

          if (response.class_idErr){
            $("#class-id").addClass("is-invalid");
            $("#class-id").siblings(".invalid-feedback").text(response.class_idErr).show();
          } else {
            $("#class-id").removeClass("is-invalid");
          }

          if (response.subject_idErr){
            $("#dropdown-subject").addClass("is-invalid");
            $("#dropdown-subject").siblings(".invalid-feedback").text(response.subject_idErr).show();
          } else {
            $("#dropdown-subject").removeClass("is-invalid");
          }
          
          if(response.subject_typeErr){
            $(".subject-type").addClass("is-invalid");
            $(".subject-type").siblings(".invalid-feedback").html(cleanInput(response.subject_typeErr)).show();
          } else {
            $(".subject-type").removeClass("is-invalid");
          }

          if (response.section_idErr){
            $("#dropdown-section").addClass("is-invalid");
            $("#dropdown-section").siblings(".invalid-feedback").text(response.section_idErr).show();
          } else {
            $("#dropdown-section").removeClass("is-invalid");
          }

          if (response.teacher_assignedErr){
            $("#dropdown-teacher").addClass("is-invalid");
            $("#dropdown-teacher").siblings(".invalid-feedback").text(response.teacher_assignedErr).show();
          } else {
            $("#dropdown-teacher").removeClass("is-invalid");
          }

        } else if (response.status === "success") {
          alert('Class details updated successfully.');
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("#form-edit")[0].reset(); // Reset the form
          // Optionally, reload page to show new entry
          viewroomStatus();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to load save-room-status.php.');
        console.error("Error saving php room status:", status, error);
      }
    });
  }

  //Load delete modal
  function deletingclassDetails(classId, subType){
    return $.ajax({
      type: "GET", // Use GET request
      url: "../class-room-status/deleting-class-detail.html?v=" + new Date().getTime(), // URL to get product data
      dataType: "html", // Expect JSON response
      success: function (view) {
        // Assuming 'view' contains the new content you want to display
        $(".modal-container").empty().html(view); // Load the modal view
        $("#staticBackdrop").modal("show"); // Show the modal
        $("#staticBackdroped").attr("data-id", classId, subType);

        const modal = $('#staticBackdrop');
        
        $.ajax({
          url: `../fetch-data/fetch-class-detail.php?classId=${classId}&subType=${subType}`,
          dataType: "json",
          success: function(data) {
              console.log('Fetched data:', data.class_id, data.subtype_id); // For debugging
              //Fetch class id from query
              $('#hidden-class-id').val(data.class_id);
              //Fetch class subject id
              $('#hidden-subtype-id').val(data.subtype_id);
          },
          error: function(xhr, status, error) {
              console.error("Error fetching status record:", error);
          }
        });

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add product form submission
        $("#form-delete").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          deleteclassDetails(); // Call function to save product
        });
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
  } 

  function deleteclassDetails(){
    const submitButton = $("#form-delete button[type='submit']");
    submitButton.prop('disabled', true);
    
    const formClassDetails = $("#form-delete").serialize();
    console.log("Sending data:", formClassDetails);

    $.ajax({
      type: "POST", // Use POST request
      url: "../class-room-status/delete-class-details.php", // URL for saving room
      data: formClassDetails, // Serialize the form data for submission, Add ID to form data
      dataType: "json", // Expect JSON response
      success: function (response) {
        console.log("Response received:", response);
        if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("#form-delete")[0].reset(); // Reset the form
          // Optionally, reload page to show new entry
          viewroomStatus();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to load delete-room-status.php.');
        console.error("Error deleting class schedule status:", status, error);
      }

    });
  }



  //Function for room status, MODAL AJAX
  //add room status
  function addroomStatus() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../class-room-status/add-room-status.html?v=" + new Date().getTime(), // URL for add product view
      dataType: "html", // Expect HTML response
      success: function (view) {
        $(".modal-container").html(view); // Load the modal view
        console.log("Modal content loaded successfully.");
        $("#staticBackdrop").modal("show");
        
        const modal = $('#staticBackdrop');

        //DROP DOWN FOR CLASS ID
        const classText = $('#dropdown-class-id');
        const classId = $('#hidden-class-id');
        const classList = $('#dropdown-list-class-id');
        customDropdown(classText, classList, classId, "../fetch-data/fetch-classes.php", function(data, dropdownList) {
          $.each(data, function (index, classes) {
            dropdownList.append(
              $("<div>", {
                text: classes.class_sub,
                'data-value': classes.class_id,
                'data-display': classes.class_display
              })
            );
          });
        });

        // keep class name display in sync and clear errors on selection
        classList.on('click', 'div', function(){
          const displayText = $(this).data('display') || '';
          $("#class-name-display").val(displayText);
          $("#dropdown-class-id").removeClass("is-invalid");
          $("#dropdown-class-id").siblings(".invalid-feedback").hide();
        });


        //DROP DOWN FOR FIRST ROOM
        const roomText = $('#dropdown-room');
        const roomId = $('#hidden-room-id');
        const roomList = $('#dropdown-list-name');
        customDropdown(roomText, roomList, roomId, "../fetch-data/fetch-room-name.php", function(data, dropdownList) {
          $.each(data, function(index, room) {
              dropdownList.append(
                  $("<div>", {
                      text: room.room_name, // Displayed text
                      'data-value': `${room.room_code}|${room.room_no}` // Value attribute
                  })
              );
          });
        });


        //DROP DOWN FOR SECOND ROOM
        const roomTextLab = $('#dropdown-room-2');
        const roomIdLab = $('#hidden-room-id-2');
        const roomListLab = $('#dropdown-list-name-2');
        customDropdown(roomTextLab, roomListLab, roomIdLab, "../fetch-data/fetch-room-name.php", function(data, dropdownList) {
          $.each(data, function(index, room) {
              dropdownList.append(
                  $("<div>", {
                      text: room.room_name, // Displayed text
                      'data-value': `${room.room_code}|${room.room_no}` // Value attribute
                  })
              );
          });
        });

        // Fix: Update checkbox event handler
        $('input[name="day-id[]"]').on("change", function() {
          const checkedCheckboxes = $('input[name="day-id[]"]:checked');
          const checkedCount = checkedCheckboxes.length;
      
          if (checkedCount > 2) {
              $(this).prop('checked', false);
              return; // Exit if limit exceeded
          }
        });

        // Fix: Update checkbox event handler
        $('input[name="subject-type[]"]').on("change", function() {
          const checkedCheckboxes = $('input[name="subject-type[]"]:checked');
          const checkedCount = checkedCheckboxes.length;
          // Show div-room if both checkboxes are checked
          if (checkedCount === 2) {
              $('.div-time').show();
              $('.div-day').css('display', 'flex');
              $('#determiner-type').val('true');

              $('#hidden-room-id-2').prop('disabled', false);
              // $('#determiner-room').val('true');
          } else {
              $('.div-time').hide();
              $('.div-day').hide();
              $('#determiner-type').val('false');

              $('#hidden-room-id-2').prop('disabled', true);
              // $('#determiner-room').val('false');
          }
        });


        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add room status form submission
        $("#form-add").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          // ensure hidden class-id mirrors typed/selected value so backend receives it
          if (!$('#hidden-class-id').val() && $('#dropdown-class-id').val()) {
            $('#hidden-class-id').val($('#dropdown-class-id').val());
          }
          saveroomStatus(); // Call function to save room status
        });
        
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
  }

  function saveroomStatus(){
    
    // Debug what's being sent  
    const formaddclassStatus = $("#form-add").serialize();
    console.log("Sending data:", formaddclassStatus);
    
    $.ajax({
      type: "POST", // Use POST request
      url: "../class-room-status/save-room-status.php", // URL for saving room
      data: formaddclassStatus, // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "error") {
          // Handle validation errors
          if (response.generalErr){
            $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr));
          } else {
            $("#general-error").addClass("d-none");
          }

          if (response.subject_typeErr){
            $(".subject-type").addClass("is-invalid"); // Mark field as invalid
            $(".subject-type").siblings(".invalid-feedback").text(response.subject_typeErr).show(); // Show error message
          } else {
            $(".subject-type").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.class_idErr){
            $("#dropdown-class-id").addClass("is-invalid");
            $("#dropdown-class-id").siblings(".invalid-feedback").text(response.class_idErr).show();
          } else {
            $("#dropdown-class-id").removeClass("is-invalid");
          }

          if (response.generalErr1){
            $("#general-error-1").removeClass("d-none").html(cleanInput(response.generalErr1));
          } else {
            $("#general-error-1").addClass("d-none");
          }

          if (response.start_time_1Err){
            $("#start-time-1").addClass("is-invalid"); // Mark field as invalid
            $("#start-time-1").siblings(".invalid-feedback").text(response.start_time_1Err).show(); // Show error message
          } else {
            $("#start-time-1").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.end_time_1Err){
            $("#end-time-1").addClass("is-invalid"); // Mark field as invalid
            $("#end-time-1").siblings(".invalid-feedback").text(response.end_time_1Err).show(); // Show error message
          } else {
            $("#end-time-1").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.day_id_1Err){
            $(".day-id-1").addClass("is-invalid"); // Mark field as invalid
            $(".day-id-1").siblings(".invalid-feedback").text(response.day_id_1Err).show(); // Show error message
          } else {
            $(".day-id-1").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.room_id_1Err){
            $("#dropdown-room").addClass("is-invalid"); // Mark field as invalid
            $("#dropdown-room").siblings(".invalid-feedback").text(response.room_id_1Err).show(); // Show error message
          } else {
            $("#dropdown-room").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
          
          //error for inputs 2
          if (response.generalErr2){
            $("#general-error-2").removeClass("d-none").html(cleanInput(response.generalErr2));
          } else {
            $("#general-error-2").addClass("d-none");
          }

          if (response.start_time_2Err){
            $("#start-time-2").addClass("is-invalid"); // Mark field as invalid
            $("#start-time-2").siblings(".invalid-feedback").text(response.start_time_2Err).show(); // Show error message
          } else {
            $("#start-time-2").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.end_time_2Err){
            $("#end-time-2").addClass("is-invalid"); // Mark field as invalid
            $("#end-time-2").siblings(".invalid-feedback").text(response.end_time_2Err).show(); // Show error message
          } else {
            $("#end-time-2").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.day_id_2Err){
            $(".day-id-2").addClass("is-invalid"); // Mark field as invalid
            $(".day-id-2").siblings(".invalid-feedback").text(response.day_id_2Err).show(); // Show error message
          } else {
            $(".day-id-2").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
          if (response.room_id_2Err){
            $("#dropdown-room-2").addClass("is-invalid"); // Mark field as invalid
            $("#dropdown-room-2").siblings(".invalid-feedback").text(response.room_id_2Err).show(); // Show error message
          } else {
            $("#dropdown-room-2").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
        } else if (response.status === "success") {
          const submitButton = $("#form-add button[type='submit']");
          submitButton.prop('disabled', true);
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("#form-add")[0].reset(); // Reset the form
          // Optionally, reload roomlist to show new entry
          viewroomStatus();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to load save-room-status.php.');
        console.error("Error saving php room status:", status, error);
      }

    });
  }

  function editroomStatus(classID, subType, classDay){
    return $.ajax({
      type: "GET", // Use GET request
      url: "../class-room-status/edit-room-status.php?v=" + new Date().getTime(), // URL to get product data
      dataType: "html", // Expect JSON response
      success: function (view) {
        // Assuming 'view' contains the new content you want to display
        $(".modal-container").empty().html(view); // Load the modal view
        $("#staticBackdrop").modal("show"); // Show the modal
        $("#staticBackdroped").attr("data-id");

        const modal = $('#staticBackdrop');
        
        // Then fetch and populate the data
        $.ajax({
          url: `../fetch-data/fetch-room-status.php?classID=${classID}&subType=${subType}&classDay=${classDay}`,
          dataType: "json",
          success: function(data){
            console.log('Fetched data:', data); // For debugging
            console.log('Original Day ID:', data.class_day);
            const displayContent = cleanInput(`${data.class_id}---LC|LAB---${data.subject_units}`);

            $('#hidden-original-class-id').val(data.class_id);
            $('#hidden-original-subtype').val(data.subject_type);
            $('#hidden-original-start-time').val(data.start_time);//what start time
            $('#hidden-original-end-time').val(data.end_time);//what end time
            $('#hidden-original-day-id').val(data.class_day);//what day
            $('#hidden-original-room').val(data.room_name);//what day

            //Fetch class id
            $('#dropdown-class-id').val(displayContent);
            $('#hidden-class-id').val(data.class_id);

            $(`input[name="subject-type"][value="${data.subject_type}"]`).prop('checked', true);

            // Check the appropriate day radio
            $(`input[name="day-id"][value="${data.class_day}"]`).prop('checked', true);

            // Populate time fields
            $('#start-time').val(data.start_time);
            $('#end-time').val(data.end_time);

            $('#dropdown-room').val(data.room_name);
            $('#hidden-room-id').val(data.room_id);

          },
          error: function(xhr, status, error) {
              console.error("Error fetching status record:", error);
          }
        });
        
        //DROP DOWN FOR CLASS ID
        const classText = $('#dropdown-class-id');
        const classId = $('#hidden-class-id');
        const classList = $('#dropdown-list-class-id');

        customDropdown(classText, classList, classId, "../fetch-data/fetch-classes.php", function(data, dropdownList) {
          $.each(data, function (index, classes) {

            dropdownList.append(
              $("<div>", {
                text: `${classes.class_sub}---LC|LB---${classes.subject_units}`,
                'data-value': classes.class_id
              })
            );
          });
        });

        const roomText = $('#dropdown-room');
        const roomId = $('#hidden-room-id');
        const roomList = $('#dropdown-list-name');
        // fetchroomName(roomText, roomList, roomId);
        customDropdown(roomText, roomList, roomId, "../fetch-data/fetch-room-name.php", function(data, dropdownList) {
          $.each(data, function(index, room) {
              dropdownList.append(
                  $("<div>", {
                      text: room.room_name, // Displayed text
                      'data-value': `${room.room_code}|${room.room_no}` // Value attribute
                  })
              );
          });
        });

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add product form submission
        $("#form-edit").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          updateroomStatus(); // Call function to save product
        });
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
  }

  function updateroomStatus(){
    const submitButton = $("#form-edit button[type='submit']");
    submitButton.prop('disabled', true);

    // Debug what's being sent
    const formClassStatus = $("#form-edit").serialize();
    console.log("Sending data:", formClassStatus);

    $.ajax({
      type: "POST", // Use POST request
      url: "../class-room-status/update-room-status.php?v=" + new Date().getTime(), // URL for saving room
      data: formClassStatus, // Serialize the form data for submission, Add ID to form data
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "error") {
          // Handle validation errors
          if (response.generalErr){
            $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr));
          } else {
            $("#general-error").addClass("d-none");
          }

          if (response.class_idErr){
            $("#dropdown-class-id").addClass("is-invalid"); // Mark field as invalid
            $("#dropdown-class-id").siblings(".invalid-feedback").text(response.class_idErr).show(); // Show error message
          } else {
            $("#dropdown-class-id").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.subject_typeErr){
            $(".subject-type").addClass("is-invalid"); // Mark field as invalid
            $(".subject-type").siblings(".invalid-feedback").text(response.subject_typeErr).show(); // Show error message
          } else {
            $(".subject-type").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.generalErr1){
            $("#general-error-1").removeClass("d-none").html(cleanInput(response.generalErr1));
          } else {
            $("#general-error-1").addClass("d-none");
          }

          if (response.start_time_1Err){
            $("#start-time").addClass("is-invalid"); // Mark field as invalid
            $("#start-time").siblings(".invalid-feedback").text(response.start_time_1Err).show(); // Show error message
          } else {
            $("#start-time").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.end_time_1Err){
            $("#end-time").addClass("is-invalid"); // Mark field as invalid
            $("#end-time").siblings(".invalid-feedback").text(response.end_time_1Err).show(); // Show error message
          } else {
            $("#end-time").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.day_id_1Err){
            $(".day-id-1").addClass("is-invalid"); // Mark field as invalid
            $(".day-id-1").siblings(".invalid-feedback").text(response.day_id_1Err).show(); // Show error message
          } else {
            $(".day-id-1").removeClass("is-invalid"); // Remove invalid class if no error
          }

          if (response.room_id_1Err){
            $("#dropdown-room").addClass("is-invalid"); // Mark field as invalid
            $("#dropdown-room").siblings(".invalid-feedback").text(response.room_id_1Err).show(); // Show error message
          } else {
            $("#dropdown-room").removeClass("is-invalid"); // Remove invalid class if no error
          }
          
        } else if (response.status === "success") {
          alert('Class Schedule updated successfully.');
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("#form-edit")[0].reset(); // Reset the form
          // Optionally, reload roomlist to show new entry
          viewroomStatus();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to load update-room-status.php.');
        console.error("Error updating class schedule status:", status, error);
      }

    });

  }

  //Load delete modal
  function deleteconfirmationStatus(classID, subType, classDay){
    return $.ajax({
      type: "GET", // Use GET request
      url: "../class-room-status/delete-confirmation-status.html?v=" + new Date().getTime(), // URL to get product data
      dataType: "html", // Expect JSON response
      success: function (view) {
        // Assuming 'view' contains the new content you want to display
        $(".modal-container").empty().html(view); // Load the modal view
        $("#staticBackdrop").modal("show"); // Show the modal
        $("#staticBackdroped").attr("data-id");

        const modal = $('#staticBackdrop');
        
        $.ajax({
          url: `../fetch-data/fetch-room-status.php?classID=${classID}&subType=${subType}&classDay=${classDay}`,
          dataType: "json",
          success: function(data) {
              console.log('Fetched data:', data); // For debugging
              //Fetch class id
              $("#class-id").val(data.class_id);
              //Fetch subject type
              $("#subject-type").val(data.subject_type);
              //Fetch-class-day
              $("#class-day").val(data.class_day);
            
          },
          error: function(xhr, status, error) {
              console.error("Error fetching status record:", error);
          }
        });

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the add product form submission
        $("#form-delete").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          deleteroomStatus(); // Call function to save product
        });
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
  }

  function deleteroomStatus(){
    const submitButton = $("#form-delete button[type='submit']");
    submitButton.prop('disabled', true);
    // Debug what's being sent
    const formdeleteClassStatus = $("#form-delete").serialize();
    console.log("Sending data:", formdeleteClassStatus);
    
    $.ajax({
      type: "POST", // Use POST request
      url: "../class-room-status/delete-room-status.php", // URL for saving room
      data: formdeleteClassStatus, // Serialize the form data for submission, Add ID to form data
      dataType: "json", // Expect JSON response
      success: function (response) {
       if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("#form-delete")[0].reset(); // Reset the form
          // Optionally, reload roomlist to show new entry
          viewroomStatus();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to load delete-room-status.php.');
        console.error("Error deleting class schedule status:", status, error);
      }

    });
  }
   //function to fetch room name, goes to roomlist folder, fetch-room-name
   function customDropdown(optionText, dropdownId, optionId, fetchUrl, appendOptionsCallback) {
    const dropdownList = dropdownId;

    // Fetch data for the dropdown
    $.ajax({
        url: fetchUrl,
        type: "GET",
        dataType: "json",
        success: function(data) {
            dropdownList.empty(); // Clear existing options
            
            // Use the provided callback to append options
            appendOptionsCallback(data, dropdownList);

            // Open dropdown on input click
            optionText.on('click', function(event) {
                event.stopPropagation();
                $('.dropdown-list').not(dropdownList).hide();
                dropdownList.toggle();
                filterItems();
            });

            // Filter items based on input
            optionText.on('input', function() {
                filterItems();
            });

            // Select an item and update the input value
            dropdownList.on('click', 'div', function(event) {
                event.stopPropagation();
                const selectedText = $(this).text();
                const selectedValue = $(this).data('value');
                
                optionText.val(selectedText);
                optionId.val(selectedValue);
                dropdownList.hide();
            });

            // Function to filter items
            function filterItems() {
                const filter = optionText.val().toLowerCase();
                let hasVisibleItems = false;

                dropdownList.children('div').each(function() {
                    const item = $(this);
                    if (item.text().toLowerCase().includes(filter)) {
                        item.show();
                        hasVisibleItems = true;
                    } else {
                        item.hide();
                    }
                });

                dropdownList.toggle(hasVisibleItems);
            }

            // Close dropdown when clicking outside
            $(document).on('click', function(event) {
                if (!$(event.target).closest('.dropdown').length) {
                    dropdownList.hide();
                }
            });
        },
        error: function(xhr, status, error) {
            console.error("Error fetching data:", error);
            alert('Failed to fetch data.');
        }
    });
  }

  function cleanInput(input) {
    // Trim whitespace from both sides of the string
    input = input.trim();
    // Remove backslashes
    input = input.replace(/\\/g, '');
    // Allow specific tags and capture attributes
    const allowedTags = ['strong', 'em', 'b', 'i', 'u', 'div'];
    const tagRegex = new RegExp(`<\/?(${allowedTags.join('|')})(\\s+[^>]*)?>`, 'gi');
    // Create a temporary DOM element to escape HTML
    const tempElement = document.createElement('div');
    tempElement.innerText = input; // This automatically escapes HTML
    // Get the escaped HTML
    const sanitizedInput = tempElement.innerHTML;
    // Reintroduce allowed tags while preserving class attributes
    return sanitizedInput.replace(/&lt;/g, '<')
                         .replace(/&gt;/g, '>')
                         .replace(/&amp;/g, '&')
                         .replace(tagRegex, (match) => match);
  }

  function cleanInput(input) {
    // Trim whitespace from both sides of the string
    input = input.trim();
    // Remove backslashes
    input = input.replace(/\\/g, '');
    
    // Allow specific tags without attributes
    const allowedTags = ['strong', 'em', 'b', 'i', 'u', 'div'];
    const tagRegex = new RegExp(`<\/?(${allowedTags.join('|')})>`, 'gi');
    
    // Create a temporary DOM element to escape HTML
    const tempElement = document.createElement('div');
    tempElement.innerText = input; // This automatically escapes HTML

    // Get the escaped HTML
    const sanitizedInput = tempElement.innerHTML;

    // Reintroduce allowed tags without attributes
    return sanitizedInput.replace(/&lt;/g, '<')
                         .replace(/&gt;/g, '>')
                         .replace(/&amp;/g, '&')
                         .replace(tagRegex, (match) => match);
}
});
function goBack() {
  window.history.back();  // Go back to the previous page
}

function fetchSchedule() {
  const selectedRoom = document.getElementById('roomSelect').value;
  if (!selectedRoom) {
      alert("Please select a room.");
      return;
  }

  // Fetch schedule data based on the selected room
  fetch(`fetch_schedule.php?room=${selectedRoom}`)
      .then(response => response.json())
      .then(data => {
          const scheduleBody = document.getElementById('scheduleBody');
          scheduleBody.innerHTML = ''; // Clear previous data

          // Populate the table with data
          data.forEach(row => {
              const tr = document.createElement('tr');
              const timeCell = document.createElement('td');
              timeCell.innerText = row.time;  // Time slot
              tr.appendChild(timeCell);

              // Loop through days to populate the schedule
              for (let i = 1; i <= 6; i++) { // From Monday to Saturday
                  const td = document.createElement('td');
                  if (row[`day${i}`]) {  // Check if there's a booking
                      td.innerText = row[`day${i}`].subject + ' ' + row[`day${i}`].section + ' ' + row[`day${i}`].teacher;
                      td.classList.add('booked');  // Add class for booked slots
                  } else {
                      td.innerText = '';  // Empty if no booking
                  }
                  tr.appendChild(td);
              }
              scheduleBody.appendChild(tr);
          });
      })
      .catch(error => console.error('Error fetching schedule:', error));
    }
function loadRooms() {
    fetch('fetch_rooms.php')
        .then(response => response.json())
        .then(data => {
            const roomSelect = document.getElementById('roomSelect');
            data.forEach(room => {
                const option = document.createElement('option');
                option.value = room.name;
                option.text = room.name;
                roomSelect.appendChild(option);
            });
        });
}
document.addEventListener('DOMContentLoaded', loadRooms);

function editSubject(subjectCode) {
  return $.ajax({
    type: "GET",
    url: "../class-room-status/edit-subject-details.html?v=" + new Date().getTime(),
    dataType: "html",
    success: function (view) {
      $(".modal-container").empty().html(view);
      $("#staticBackdrop").modal("show");
      
      const modal = $('#staticBackdrop');
      
      // Fetch subject data
      $.ajax({
        url: `../class-room-status/fetch-subject-details.php?subjectCode=${subjectCode}`,
        dataType: "json",
        success: function(data) {
          console.log('Fetched subject data:', data);
          
          $('#original-subject-code').val(data.subject_code);
          $('#subject-code').val(data.subject_code);
          $('#description').val(data.description);
          $('#lab-units').val(data.lab_units);
          $('#lec-units').val(data.lec_units);
        },
        error: function(xhr, status, error) {
          console.error("Error fetching subject:", error);
        }
      });
      
      $(".modal-close").on("click", function (e) {
        e.preventDefault();
        closeModal(modal);
      }); 

      $("#form-edit-subject").on("submit", function (e) {
        e.preventDefault();
        updateSubject();
      });
    },
    error: function (xhr, status, error) {
      alert("An error occurred while loading the modal: " + error);
    }
  });
}

function updateSubject() {
  const formData = $("#form-edit-subject").serialize();
  
  $.ajax({
    type: "POST",
    url: "../class-room-status/update-subject-details.php",
    data: formData,
    dataType: "json",
    success: function (response) {
      if (response.status === "error") {
        $(".is-invalid").removeClass("is-invalid");
        $(".invalid-feedback").hide();
        
        if (response.generalErr) {
          $("#general-error").removeClass("d-none").html(cleanInput(response.generalErr));
        }
        if (response.subject_codeErr) {
          $("#subject-code").addClass("is-invalid").siblings(".invalid-feedback").text(response.subject_codeErr).show();
        }
        if (response.descriptionErr) {
          $("#description").addClass("is-invalid").siblings(".invalid-feedback").text(response.descriptionErr).show();
        }
        if (response.lab_unitsErr) {
          $("#lab-units").addClass("is-invalid").siblings(".invalid-feedback").text(response.lab_unitsErr).show();
        }
        if (response.lec_unitsErr) {
          $("#lec-units").addClass("is-invalid").siblings(".invalid-feedback").text(response.lec_unitsErr).show();
        }
      } else if (response.status === "success") {
        alert('Subject updated successfully!');
        $("#staticBackdrop").modal("hide");
        $("#form-edit-subject")[0].reset();
        viewroomStatus();
      }
    },
    error: function (xhr, status, error) {
      alert('Failed to update subject.');
      console.error("Error:", status, error);
    }
  });
}

function deleteSubject(subjectCode) {
  if (!confirm('Are you sure you want to delete this subject? This will also delete all related class details!')) {
    return $.Deferred().resolve();
  }
  
  return $.ajax({
    type: "POST",
    url: "../class-room-status/delete-subject-details.php",
    data: { 'subject-code': subjectCode },
    dataType: "json",
    success: function(response) {
      if (response.status === 'success') {
        alert('Subject deleted successfully!');
        viewroomStatus();
      } else {
        alert(response.generalErr || 'Delete failed');
      }
    },
    error: function() {
      alert('Failed to delete subject.');
    }
  });
}