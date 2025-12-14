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
    viewroomSchedule(); // Load the correct schedule view
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
      url: "../class-room-status/viewclass-status-content.php", // URL for the content-only view
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

          // Set the dropdown value to the current day for admin only
          // For staff and students, show all schedules by default
          if (userPermissions.isAdmin) {
            selectDay.value = currentDay;
            fetchDayData(); // Fetch data for the current day
          } else {
            // For staff and students, reset to first option (Choose...) to show all schedules
            selectDay.selectedIndex = 0;
            fetchDayData(); // Fetch all data
            
            // Add additional refresh for students to ensure latest data
            setTimeout(() => {
              console.log("Refreshing data for students to ensure latest updates");
              fetchDayData();
            }, 1000); // Refresh after 1 second
          }
        }

        function fetchDayData(){
          const selectedDay = selectDay.value;
          
          // Add more aggressive cache-busting
          const timestamp = new Date().getTime();
          const random = Math.random();
          
          console.log("Fetching data for day:", selectedDay, "with timestamp:", timestamp);

          // Make an AJAX call to fetch data based on the selected day
          $.ajax({
              type: "POST", // Use POST request
              url: "../fetch-data/fetch-scheduled-classday.php?t=" + timestamp + "&r=" + random, // Add cache-busting
              data: { selected_day: selectedDay }, // Send selected day as data
              // dataType: 'json',
              success: function(response) {
                console.log("Selected option:", selectedDay);
                console.log("Response length:", response.length);
                console.log("Response content:", response); // Add this to see actual content

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
          
          // Check which button was clicked
          if (button.hasClass('room-schedule')) {
            // Handle room-schedule button
            const classId = button.data('classid');
            const classDay = button.data('classday');
            const subjectType = button.data('subjecttype');
            
            // Add room schedule functionality here if needed
            
          } else if (button.hasClass('room-status')) {
            // Handle room-status button (Occupy button) - Check permissions
            if (!userPermissions.isAdmin && !userPermissions.isStaff) {
              button.prop("disabled", false);
              return; // Exit if user doesn't have permissions
            }
            
            const classId = button.data('classid');
            const classDay = button.data('classday');
            const subjectType = button.data('subjecttype');
            
            console.log('Occupy button clicked:', {classId, subjectType, classDay});
            
            // Toggle the status
            toggleRoomStatus(classId, subjectType, classDay, button).always(function(){
              button.prop("disabled", false);
            });
            
          } else if (button.hasClass('edit-room-status')) {
            // Handle edit-room-status button - Check permissions
            if (!userPermissions.isAdmin) {
              button.prop("disabled", false);
              return; // Exit if user doesn't have admin permissions
            }
            
            const classId = button.data('classid');
            const subType = button.data('subjecttype');
            const classDay = button.data('classday');

            editroomStatus(classId, subType, classDay).always(function(){
              button.prop("disabled", false);
            });
            
          } else if (button.hasClass('display-status')) {
            // Handle display-status button - Check permissions
            if (!userPermissions.isAdmin) {
              button.prop("disabled", false);
              return; // Exit if user doesn't have admin permissions
            }
            
            const classId = button.data('classid');
            const classDay = button.data('classday');
            const subjectType = button.data('subjecttype');
            
            // Navigate to schedule tab and highlight the class
            viewroomSchedule();
            
            // After loading schedule, highlight the specific class
            setTimeout(() => {
              highlightClassInSchedule(classId, classDay, subjectType);
              button.prop("disabled", false);
            }, 500);
            
          } else if (button.hasClass('delete-room-status')) {
            // Handle delete-room-status button
            const classId = button.data('classid');
            const subType = button.data('subjecttype');
            const classDay = button.data('classday');

            deleteconfirmationStatus(classId, subType, classDay).always(function(){
              button.prop("disabled", false);
            });
          }
        });

        // Move Class Details List button handlers to global scope
        $(document).on("click", ".delete-class-details", function(e){
            e.preventDefault();
            const button = $(this);
            button.prop("disabled", true);

            const classId = $(this).data('classid');
            const subType = $(this).data('subtype');

            deleteconfirmationClassDetails(classId, subType).always(function(){
              button.prop("disabled", false);
            });
          });

          $(document).on("click", ".edit-class-details", function(e){
            e.preventDefault();
            const button = $(this);
            button.prop("disabled", true);

              const classId = $(this).data('classid');
              const subType = $(this).data('subtype');

              // Pass the clicked button so the loader can prefill the modal from the table row
              editclassDetails(classId, subType, $(this)).always(function(){
                button.prop("disabled", false);
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
        
        // Helper to show remarks in a Bootstrap modal
        function showRemarksModal(content){
          // create modal if not present
          if (!document.getElementById('remarksModal')){
            const modalHtml = `
              <div class="modal fade" id="remarksModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-sm modal-dialog-centered">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Remarks</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="remarksModalBody"></div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                  </div>
                </div>
              </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
          }
          // set content and show
          const bodyEl = document.getElementById('remarksModalBody');
          if (bodyEl) bodyEl.innerText = content;
          const modalEl = document.getElementById('remarksModal');
          if (modalEl) {
            try {
              const bsModal = new bootstrap.Modal(modalEl);
              bsModal.show();
            } catch (e) {
              // fallback to alert
              alert(content);
            }
          } else {
            alert(content);
          }
        }

        // Also add a dedicated handler to popup remarks when Display button is clicked.
        // This will attempt to fetch the authoritative remarks via AJAX and fall back to the table cell.
        $(document).on('click', '#table-room-status .display-status', function(e){
          e.preventDefault();
          const btn = $(this);
          const row = btn.closest('tr');
          const classId = btn.data('classid') || row.find('td').eq(0).text().trim();
          const subjectType = btn.data('subjecttype') || row.find('td').eq(4).text().trim();
          const classDay = btn.data('classday') || row.find('td').eq(2).text().trim();

          // Fallback helper to read from DOM cell
          const readCellRemarks = function(){
            try { let r = row.find('td').eq(10).text().trim(); return r || 'No remarks'; } catch (err) { return 'No remarks'; }
          };

          if (classId && subjectType && classDay) {
            $.ajax({
              url: '../fetch-data/get-class-remarks.php',
              method: 'POST',
              dataType: 'json',
              data: { class_id: classId, subject_type: subjectType, day: classDay },
              success: function(resp){
                if (resp && resp.status === 'success'){
                  const text = resp.remarks && resp.remarks.length ? resp.remarks : readCellRemarks();
                  showRemarksModal(text);
                } else {
                  showRemarksModal(readCellRemarks());
                }
              },
              error: function(){
                showRemarksModal(readCellRemarks());
              }
            });
          } else {
            // If we don't have identifying data, just read the table cell
            showRemarksModal(readCellRemarks());
          }
        });
      },
    });
  }


  //Function to load room schedule view, load content
  //edit here
  function viewroomSchedule() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../room-schedule/viewroom-schedule-content.php", // URL for the content-only view
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
              cell.css({
                "background-color": "#ff6b6b",
                "color": "#000000",
                "font-weight": "bold",
                "font-size": "14px",
                "padding": "10px",
                "text-align": "center",
                "border": "2px solid #000000",
                "box-shadow": "inset 0 0 10px rgba(0,0,0,0.3)",
                "text-shadow": "1px 1px 2px rgba(255,255,255,0.8)",
                "min-height": "60px",
                "vertical-align": "middle"
              }).html(text.trim());
            }
          });
        }

        function fetchSchedule(){
          const roomVal = $("#schedule-room").val();
          const dayVal = $("#schedule-day").val();
          if (!roomVal){ alert('Please select a room.'); return; }
          $.ajax({
            url: "../fetch-data/fetch-schedule.php?t=" + new Date().getTime(), // Add cache-busting timestamp
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

        // Use event delegation for dynamically loaded content
        $(document).on("click", ".edit-user", function (e) {
          e.preventDefault();
          const payload = {
            user_id: $(this).data('user_id'),
            username: $(this).data('username'),
            is_admin: $(this).data('is_admin'),
            is_staff: $(this).data('is_staff')
          };
          editUserModal(payload);
        });

        $(document).on("click", ".delete-user", function (e) {
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
        $(".modal-close").off("click").on("click", function (e) { e.preventDefault(); closeModal(modal); });
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
        $(".modal-close").off("click").on("click", function (e) { e.preventDefault(); closeModal(modal); });
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
          // Check permissions before proceeding
          if (!userPermissions.isAdmin && !userPermissions.isStaff) {
            return; // Exit if user doesn't have permissions
          }
          viewroomStatus();
        });

        $(".room-schedule").on("click", function (e) {
          e.preventDefault();
          const button = $(this);

          // Get room info from data attributes or table cells
          let roomCode = button.data('roomcode');
          let roomNo = button.data('roomno');
          const rowRoomText = button.closest('tr').find('td:nth-child(2)').text().trim();
          if (!roomCode || !roomNo) {
            // try to parse from the displayed room name (e.g. "LR 1")
            const parts = rowRoomText.split(/\s+/);
            roomCode = parts[0] || '';
            roomNo = parts[1] || '';
          }

          $.ajax({
            type: "GET",
            url: "../class-room-status/schedule-class-modal.html",
            dataType: 'html',
            success: function (modalHtml) {
              $(".modal-container").html(modalHtml);

              // Populate class select and clear other fields
              $("#schedule-class-id").empty().append($('<option>', { value: '', text: 'Select class...' }));
              $("#schedule-subject").val('');
              $("#schedule-section").val('');

              // Load class options (class_id + subject_type) so FK will match
              loadClassOptions();

              const currentRoom = roomCode + ' ' + roomNo;
              $("#current-room-info").text(currentRoom);

              // Populate schedule-room select with the clicked room and select it
              const roomSelect = $("#schedule-room");
              roomSelect.empty();
              roomSelect.append($('<option>', { value: roomCode + '|' + roomNo, text: currentRoom, selected: true }));

              // class-id is prefilled with room identifier; no class list needed

              // Show modal using Bootstrap 5 API
              const modalEl = document.getElementById('scheduleClassModal');
              if (modalEl) {
                const bsModal = new bootstrap.Modal(modalEl);
                bsModal.show();
              }

              // Attach submit handler
              $("#schedule-class-form").off('submit').on("submit", function(e) {
                e.preventDefault();
                saveClassSchedule();
              });
            },
            error: function () {
              alert("Error loading schedule modal.");
            }
          });
        });

        function highlightClassInSchedule(classId, classDay, subjectType) {
          // Find the class in the schedule grid and highlight it
          const dayIndex = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
          const targetDay = dayIndex[classDay];
          
          // Look for cells containing the class ID
          $("#table-room-schedule tbody tr").each(function() {
            const row = $(this);
            const timeLabel = row.find("td:first").text().trim();
            
            // Check each day column for this class
            row.find("td:not(:first)").each(function(index) {
              const cell = $(this);
              const cellText = cell.text().trim();
              
              // Check if this cell contains our class
              if (cellText.includes(classId)) {
                // Highlight the cell
                cell.addClass("bg-warning border border-warning").css({
                  "background-color": "#fff3cd",
                  "border": "2px solid #ffc107",
                  "font-weight": "bold"
                });
                
                // Scroll to the highlighted cell
                cell[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Show a tooltip or alert
                setTimeout(() => {
                  cell.attr("title", `Class ${classId} - ${subjectType}`);
                }, 100);
              }
            });
          });
        }

        function loadAvailableRooms(currentRoom = null) {
          $.ajax({
            type: "GET",
            url: "../fetch-data/fetch-rooms.php",
            dataType: "json",
            success: function (rooms) {
              const roomSelect = $("#schedule-room");
              roomSelect.empty();
              roomSelect.append('<option value="">Select room...</option>');
              
              $.each(rooms, function (index, room) {
                const roomValue = room.room_code + ' ' + room.room_no;
                const optionValue = room.room_code + '|' + room.room_no;
                const isSelected = (currentRoom && roomValue === currentRoom) ? 'selected' : '';
                
                roomSelect.append(
                  $("<option>", {
                    value: optionValue,
                    text: roomValue,
                    selected: isSelected
                  })
                );
              });
            },
            error: function () {
              alert("Error loading rooms.");
            }
          });
        }

        // Load class options and auto-select the first available class
        function loadClassOptions() {
          const tryPaths = [
            '../fetch-data/fetch-classes.php',
            'fetch-data/fetch-classes.php',
            '/Room_Utilization/fetch-data/fetch-classes.php'
          ];

          function populateClassSelect(classes) {
            const classSelect = $('#schedule-class-id');
            classSelect.empty();
            classSelect.append($('<option>', { value: '', text: 'Select class...' }));
            $.each(classes, function(index, cls) {
              const classId = cls.class_id || cls.classId || cls.id || '';
              const subjectId = cls.subject_id || cls.subjectId || cls.subject || '';
              const subjectType = cls.subject_type || cls.subjectType || '';
              const section = cls.section_name || cls.section || '';
              if (!classId) return; // skip malformed
              const display = classId + (subjectType ? (' ' + subjectType) : '') + (section ? (' - ' + section) : '');
              const value = classId + '|' + subjectType;
              classSelect.append($('<option>', { value: value, text: display, 'data-subject-id': subjectId, 'data-section': section }));
            });

            // Auto-select the first real option (if any)
            const firstOpt = classSelect.find('option').not('[value=""]').first();
            if (firstOpt.length) {
              firstOpt.prop('selected', true);
              const subjId = firstOpt.data('subject-id') || '';
              const section = firstOpt.data('section') || '';
              $('#schedule-subject').val(subjId);
              $('#schedule-section').val(section);
            }
            $('#schedule-class-id').off('change').on('change', function() {
              const opt = $(this).find('option:selected');
              $('#schedule-subject').val(opt.data('subject-id') || '');
              $('#schedule-section').val(opt.data('section') || '');
            });
          }

          function tryFetch(idx) {
            if (idx >= tryPaths.length) {
              console.error('All attempts to load class options failed or returned empty.');
              return;
            }
            $.ajax({
              type: 'GET',
              url: tryPaths[idx],
              dataType: 'json',
              success: function(classes) {
                if (Array.isArray(classes) && classes.length > 0) {
                  populateClassSelect(classes);
                } else {
                  // try next path
                  tryFetch(idx + 1);
                }
              },
              error: function() {
                tryFetch(idx + 1);
              }
            });
          }

          tryFetch(0);
        }

        

        function saveClassSchedule() {
          // schedule-class-id value is expected as classId|subjectType
          const selectedClassVal = $("#schedule-class-id").val() || '';
          const roomVal = $("#schedule-room").val() || '';
          const roomData = roomVal.split('|');
          if (!selectedClassVal) {
            alert('Please select a class.');
            return;
          }

          const classParts = selectedClassVal.split('|');
          const classId = classParts[0] || '';
          const subjectType = classParts[1] || '';

          // Gather other form fields
          const startTime = $("#schedule-start-time").val() || '';
          const endTime = $("#schedule-end-time").val() || '';
          const day = $("#schedule-day").val() || '';

          if (!classId || !subjectType || !roomData[0] || !roomData[1] || !startTime || !endTime || !day) {
            alert('Missing required fields.');
            return;
          }

          // Build data payload matching server expectations (server expects 'class-id' and 'subject')
          const data = {
            'class-id': classId,
            'subject': subjectType,
            'day': day,
            'room-code': roomData[0],
            'room-no': roomData[1],
            'start-time': startTime,
            'end-time': endTime
          };

          $.ajax({
            type: "POST",
            url: "../class-room-status/save-class-schedule.php",
            data: data,
            dataType: "json",
            success: function (response) {
              if (response.status === 'success') {
                const modalEl = document.getElementById('scheduleClassModal');
                if (modalEl) {
                  const bsModal = bootstrap.Modal.getInstance(modalEl);
                  if (bsModal) bsModal.hide();
                }
                alert(response.message);
                viewroomStatus(); // Refresh the status list
              } else {
                alert(response.message || 'Error scheduling class.');
              }
            },
            error: function (xhr, status, err) {
              console.error('AJAX error:', status, err, xhr.responseText);
              alert("Error scheduling class. See console for details.");
            }
          });
        }

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
      type: "GET",
      url: "../class-room-status/add-class-detail.html?v=" + new Date().getTime(),
      dataType: "html",
      success: function (view) {
        $(".modal-container").html(view);
        console.log("Modal content loaded successfully.");
        $("#staticBackdrop").modal("show");
        const modal = $('#staticBackdrop');
        
        const subjectText= $('#dropdown-subject');
        const subjectList = $('#dropdown-list-subject');
        const subjectId = $('#hidden-subject-id');
        customDropdown(subjectText, subjectList, subjectId, "../fetch-data/fetch-subject.php", function(data, dropdownList) {
          $.each(data, function (index, subject) {
            const displayContent = cleanInput(`${subject.subject_id}---LC|LAB---${subject.subject_units}`);
            dropdownList.append(
              $("<div>", {
                text:displayContent,
                'data-value': subject.subject_id
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
                text: displayContent,
                'data-value': `${section.course_abbr}|${section.year_level}|${section.section}`
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
                text: teacher.teacher_name,
                'data-value': teacher.faculty_id
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
                text: teacher.teacher_name,
                'data-value': teacher.faculty_id
              })
            );
          });
        });

        // Update checkbox event handler
        $('input[name="subject-type[]"]').on("change", function() {
          const checkedCount = $('input[name="subject-type[]"]:checked').length;
          
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
          closeModal(modal);
        }); 

        // FIXED: Call the correct function
        $("#form-add").on("submit", function (e) {
          e.preventDefault();
          saveClassDetails(); // CHANGED: Now calls saveClassDetails instead of saveclassDetails
        });
        
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
}

  //Function for class details, php handling
  //save class details
function addclassDetails() {
    $.ajax({
      type: "GET",
      url: "../class-room-status/add-class-detail.html?v=" + new Date().getTime(),
      dataType: "html",
      success: function (view) {
        $(".modal-container").html(view);
        console.log("Modal content loaded successfully.");
        $("#staticBackdrop").modal("show");
        const modal = $('#staticBackdrop');
        
        const subjectText= $('#dropdown-subject');
        const subjectList = $('#dropdown-list-subject');
        const subjectId = $('#hidden-subject-id');
        customDropdown(subjectText, subjectList, subjectId, "../fetch-data/fetch-subject.php", function(data, dropdownList) {
          $.each(data, function (index, subject) {
            const displayContent = cleanInput(`${subject.subject_id}---LC|LAB---${subject.subject_units}`);
            dropdownList.append(
              $("<div>", {
                text:displayContent,
                'data-value': subject.subject_id
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
                text: displayContent,
                'data-value': `${section.course_abbr}|${section.year_level}|${section.section}`
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
                text: teacher.teacher_name,
                'data-value': teacher.faculty_id
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
                text: teacher.teacher_name,
                'data-value': teacher.faculty_id
              })
            );
          });
        });

        // Update checkbox event handler
        $('input[name="subject-type[]"]').on("change", function() {
          const checkedCount = $('input[name="subject-type[]"]:checked').length;
          
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
          closeModal(modal);
        }); 

        // FIXED: Call the correct function
        $("#form-add").on("submit", function (e) {
          e.preventDefault();
          saveClassDetails(); // CHANGED: Now calls saveClassDetails instead of saveclassDetails
        });
        
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
}

// FIND the saveclassDetails() function (around line 475-548)
// RENAME it to saveClassDetails() and update the URL:

function saveClassDetails(){
    const formClassDetails = $("#form-add").serialize(); // FIXED: Use form-add for add modal
    
    console.log("Sending data:", formClassDetails);
    
    $.ajax({
      type: "POST",
      url: "../class-room-status/save-class-detail.php", // FIXED: Use save script for add modal
      data: formClassDetails,
      dataType: "json",
      success: function (response) {
        if (response.status === "error") {
          // Clear previous errors
          $(".is-invalid").removeClass("is-invalid");
          $(".invalid-feedback").hide();
          
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
          $("#staticBackdrop").modal("hide");
          $("#form-add")[0].reset();
          alert(response.message || 'Class details added successfully!');
          viewroomStatus();
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to save class details.');
        console.error("Error saving class details:", status, error);
        console.error("Response:", xhr.responseText);
      }
    });
}
  function editclassDetails(classId, subType, $triggerButton) {
    // Split the composite ID into its parts
      return $.ajax({
        type: "GET", // Use GET request
        url: "../class-room-status/edit-class-detail.html?v=" + new Date().getTime(), // URL 
        dataType: "html", // Expect JSON response
        success: function (view) {
          // Assuming 'view' contains the new content you want to display
          $(".modal-container").empty().html(view); // Load the modal view

          const modal =  $('#staticBackdrop');
              
          // Prefill visible fields from the table row if possible (faster UX). AJAX will still fetch authoritative values.
          try {
            if ($triggerButton && $triggerButton.length) {
              const row = $triggerButton.closest('tr');
              // Columns: 0=index,1=room_name,2=room_type,3=subject_code,4=subject_type,5=section_name,6=start_time,7=end_time,8=faculty_name,9=room_status,10=remarks
              $('#original-class-id').val(classId);
              $('#class-id').val(classId);

              const subjectCode = row.find('td').eq(3).text().trim();
              if (subjectCode) {
                $('#dropdown-subject').val(subjectCode);
              }

              const subtypeText = row.find('td').eq(4).text().trim();
              if (subtypeText) {
                $('input[name="subject-type"][value="' + subtypeText + '"]').prop('checked', true);
              }

              const sectionText = row.find('td').eq(5).text().trim();
              if (sectionText) {
                $('#dropdown-section').val(sectionText);
              }

              const teacherText = row.find('td').eq(8).text().trim();
              if (teacherText) {
                $('#dropdown-teacher').val(teacherText);
              }
            }
          } catch (prefillErr) {
            console.warn('Prefill error:', prefillErr);
          }

          // Show the modal after we've prefilled visible fields so it pops up populated
          $("#staticBackdrop").modal("show"); // Show the modal
          $("#staticBackdroped").attr("data-id", classId, subType);

          // Then fetch and populate the data (authoritative)
          $.ajax({
              url: `../fetch-data/fetch-class-detail.php?classId=${classId}&subType=${subType}`, //2 parameters separated by &
              dataType: "json",
              success: function(data) {
                  console.log("Data received for edit modal:", data);
                  // alert("Data received: " + JSON.stringify(data)); // Removed debug alert
                  $('#original-class-id').val(data.class_id);
                  $('#class-id').val(data.class_id);

                  $('#original-subject-id').val(data.subject_id);
                  $('#dropdown-subject').val(data.subject_name);
                  $('#hidden-subject-id').val(data.subject_id);
                  
                  $('#original-subtype-id').val(data.subtype_id);
                  $('input[name="subject-type"][value="' + data.subtype_id + '"]').prop('checked', true);
                  
                  $('#original-section-id').val(data.section_id);
                  $('#dropdown-section').val(data.section_name);
                  $('#hidden-section-id').val(data.section_id);

                  $('#dropdown-teacher').val(data.teacher_name);
                  $('#hidden-teacher-assigned').val(data.teacher_id);

                  // Initialize dropdown lists and pre-select based on authoritative ids
                  const subjectText= $('#dropdown-subject');
                  const subjectList = $('#dropdown-list-subject');
                  const subjectId = $('#hidden-subject-id');
                  customDropdown(subjectText, subjectList, subjectId, "../fetch-data/fetch-subject.php", function(listData, dropdownList) {
                    $.each(listData, function (index, subject) {
                      const displayContent = cleanInput(`${subject.subject_id}---LC|LAB---${subject.subject_units}`);
                      dropdownList.append($('<div>', { text: displayContent, 'data-value': subject.subject_id }));
                    });
                    // Pre-select subject if available
                    if (subjectId.val()) {
                      const selectedOption = subjectList.find(`[data-value="${subjectId.val()}"]`);
                      if (selectedOption.length) subjectText.val(selectedOption.text());
                    }
                  });

                  const sectionText= $('#dropdown-section');
                  const sectionList = $('#dropdown-list-section');
                  const sectionId = $('#hidden-section-id');
                  customDropdown(sectionText, sectionList, sectionId, "../fetch-data/fetch-section.php", function(listData, dropdownList) {
                    $.each(listData, function (index, section) {
                      const displayContent = cleanInput(`${section.course_abbr}${section.year_level}${section.section}`);
                      dropdownList.append($('<div>', { text: displayContent, 'data-value': `${section.course_abbr}|${section.year_level}|${section.section}` }));
                    });
                    if (sectionId.val()) {
                      const selectedOption = sectionList.find(`[data-value="${sectionId.val()}"]`);
                      if (selectedOption.length) sectionText.val(selectedOption.text());
                    }
                  });

                  const teacherText= $('#dropdown-teacher');
                  const teacherList = $('#dropdown-list-teacher');
                  const teacherId = $('#hidden-teacher-assigned');
                  customDropdown(teacherText, teacherList, teacherId, "../fetch-data/fetch-teacher.php", function(listData, dropdownList) {
                    $.each(listData, function (index, teacher) {
                      dropdownList.append($('<div>', { text: teacher.teacher_name, 'data-value': teacher.faculty_id }));
                    });
                    if (teacherId.val()) {
                      const selectedOption = teacherList.find(`[data-value="${teacherId.val()}"]`);
                      if (selectedOption.length) teacherText.val(selectedOption.text());
                    }
                  });

              },
                  error: function(xhr, status, error) {
                      console.error("Error fetching status record:", error);
                  }
              });
          
          // Only bind to the X button in the header, not the footer close button
          $(".modal-header .modal-close").off("click").on("click", function (e) {
              e.preventDefault();
              modal.modal('hide');
          });

          $("#form-edit").on("submit", function (e) {
              e.preventDefault();
              updateclassDetails(); // FIXED: Call correct update function
          });
        },
        error: function (xhr, status, error) {
            alert("An error occurred while loading the modal: " + error);
        }
    });
  }

  function updateclassDetails(){
    // Client-side validation: class-id must be letters followed by exactly 3 digits
    const classIdVal = ($('#class-id').val() || '').trim();
    const classIdPattern = /^[A-Za-z]+[0-9]{3}$/;
    if (!classIdPattern.test(classIdVal)) {
      $('#class-id').addClass('is-invalid');
      $('#class-id').siblings('.invalid-feedback').text('Please enter letters followed by exactly 3 digits (e.g., ABC123)').show();
      return; // abort submit
    } else {
      $('#class-id').removeClass('is-invalid');
      $('#class-id').siblings('.invalid-feedback').hide();
    }

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
        alert('Failed to save class details. Please check console for details.');
        console.error("Error saving class details:", status, error);
        console.error("Response text:", xhr.responseText);
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
        
// Then fetch and populate the data
$.ajax({
url: `../fetch-data/fetch-class-detail.php?classId=${classId}&subType=${subType}`, //2 parameters separated by &
dataType: "json",
success: function(data) {
console.log("Data received for edit modal:", data);
// alert("Data received: " + JSON.stringify(data)); // Removed debug alert
$('#original-class-id').val(data.class_id);
$('#class-id').val(data.class_id);
              console.log('Fetched data:', data); // For debugging
              // alert('Delete data received: ' + JSON.stringify(data)); // Removed debug alert
              //Fetch class id from query
              $('#hidden-class-id').val(data.class_id);
              //Fetch class subject id
              $('#hidden-subtype-id').val(data.subtype_id);
          },
          error: function(xhr, status, error) {
              console.error("Error fetching status record:", error);
              // alert('Error fetching data: ' + error); // Removed debug alert
          }
        });

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the delete form submission
        $("#form-delete").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          deleteclassDetails(); // Call function to delete class details
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

    $.ajax({
      type: "POST", // Use POST request
      url: "../class-room-status/delete-class-details.php", // URL for saving room
      data: formClassDetails, // Serialize the form data for submission, Add ID to form data
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("#form-delete")[0].reset(); // Reset the form
          // Refresh the Class Details List
          location.reload(); // Simple reload to refresh the class details list
        }
      },
      error: function (xhr, status, error) {
        alert('Failed to delete class details.');
        console.error("Error deleting class details:", status, error);
      }
    }).always(function() {
      submitButton.prop('disabled', false);
    });
  }



  //Function for room status, MODAL AJAX
  //add room status
  function toggleRoomStatus(classId, subjectType, classDay, button) {
    console.log('toggleRoomStatus called with:', {classId, subjectType, classDay});
    
    return $.ajax({
      url: "../class-room-status/toggle-status.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        classId: classId,
        subjectType: subjectType,
        classDay: classDay
      }),
      dataType: "json",
      success: function(response) {
        console.log('Toggle response:', response);
        
        if (response.success) {
          // Update the status display in the table
          const row = button.closest('tr');
          const statusCell = row.find('td').eq(-3); // Status column is 3rd from the end
          
          console.log('Status cell found:', statusCell.length > 0);
          console.log('Current status text:', statusCell.text());
          
          // Update the status text
          statusCell.text(response.newStatus);
          
          // Update button text based on new status
          if (response.newStatus === 'OCCUPIED') {
            button.text('Occupy');
            button.removeClass('btn-success').addClass('btn-primary');
          } else {
            button.text('Available');
            button.removeClass('btn-primary').addClass('btn-success');
          }
          
          console.log('Status updated to:', response.newStatus);
          alert('Status updated successfully to ' + response.newStatus);
          
          // Refresh schedule table if it's currently visible
          if ($('#table-room-schedule').length > 0) {
            console.log('Refreshing schedule table...');
            // Check if a room and day are selected
            const selectedRoom = $("#schedule-room").val();
            const selectedDay = $("#schedule-day").val();
            
            if (selectedRoom && selectedDay) {
              // Re-fetch schedule data
              $.ajax({
                url: "../fetch-data/fetch-schedule.php?t=" + new Date().getTime(),
                data: { room: selectedRoom, day: selectedDay },
                dataType: "json",
                success: function(resp) {
                  if (resp.status === "success") {
                    renderSchedule(resp.data);
                    console.log('Schedule table refreshed successfully');
                  }
                },
                error: function() {
                  console.log('Failed to refresh schedule table');
                }
              });
            }
          }
        } else {
          console.error('Toggle failed:', response.message);
          alert('Error: ' + response.message);
        }
      },
      error: function(xhr, status, error) {
        console.error('AJAX Error:', status, error);
        console.error('Response text:', xhr.responseText);
        alert('Failed to update status. Please try again. Error: ' + error);
      }
    });
  }

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
          $.each(data, function (index, cls) {
            // Build a readable display: class_id + subject_type + section (if available)
            const displayText = (cls.class_id || '') + (cls.subject_type ? ' ' + cls.subject_type : '') + (cls.section_name ? ' - ' + cls.section_name : '');
            dropdownList.append(
              $("<div>", {
                text: displayText,
                'data-value': cls.class_id,
                'data-display': cls.subject_name || displayText
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
          url: `../fetch-data/fetch-room-status.php?classId=${classID}&subType=${subType}`,
          dataType: "json",
          success: function(data) {
            // Populate form fields with fetched data
            $('#hidden-original-day-id').val(data.class_day);
            $('#hidden-original-room').val(data.room_name);

            //Fetch class id
            $('#dropdown-class-id').val(data.class_id);
            $('#hidden-class-id').val(data.class_id);

            $(`input[name="subject-type"][value="${data.subject_type}"]`).prop('checked', true);

            // Check the appropriate day radio
            $(`input[name="day"][value="${data.class_day}"]`).prop('checked', true);

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
    });
  }

  function editroomStatus(classID, subType, classDay){
    return $.ajax({
      type: "GET",
      url: "../class-room-status/edit-room-status.php?v=" + new Date().getTime(),
      dataType: "html",
      success: function (view) {
        $(".modal-container").empty().html(view);
        $("#staticBackdrop").modal("show");
        const modal = $('#staticBackdrop');
        
        // Set the original values in hidden fields
        $("#hidden-original-class-id").val(classID);
        $("#hidden-original-subtype").val(subType);
        $("#hidden-original-day-id").val(classDay);
        
        //DROP DOWN FOR CLASS ID
        const classText = $('#dropdown-class-id');
        const classId = $('#hidden-class-id');
        const classList = $('#dropdown-list-class-id');

        customDropdown(classText, classList, classId, "../fetch-data/fetch-classes.php", function(data, dropdownList) {
          $.each(data, function (index, classes) {
            dropdownList.append(
              $("<div>", {
                text: classes.subject_name,
                'data-value': classes.class_id
              })
            );
          });
          
          // Pre-select the current class
          classId.val(classID);
          const selectedOption = dropdownList.find(`[data-value="${classID}"]`);
          if (selectedOption.length > 0) {
            classText.val(selectedOption.text());
          } else {
            // Fallback: if class not found in dropdown, still set the values
            classText.val(classID);
            console.log('Class ID not found in dropdown, but setting values anyway:', classID);
          }
          
          // Prevent the input field from clearing the hidden field when user types the current class
          classText.off('input').on('input', function() {
            const currentValue = $(this).val();
            // Only clear hidden field if user is typing something different from the current class
            if (currentValue !== classID) {
              classId.val('');
            }
          });
        });

        const roomText = $('#dropdown-room');
        const roomId = $('#hidden-room-id');
        const roomList = $('#dropdown-list-name');
        customDropdown(roomText, roomList, roomId, "../fetch-data/fetch-room-name.php", function(data, dropdownList) {
          $.each(data, function(index, room) {
              dropdownList.append(
                  $("<div>", {
                      text: room.room_name,
                      'data-value': `${room.room_code}|${room.room_no}`
                  })
              );
          });
        });

        // Fetch current class details and populate the form
        $.ajax({
          url: "../fetch-data/fetch-class-detail.php",
          data: { class_id: classID, subject_type: subType, day: classDay },
          dataType: "json",
          success: function(data) {
            if (data && data.length > 0) {
              const classData = data[0];
              
              // Populate subject type
              $(`input[name="subject-type"][value="${classData.subject_type}"]`).prop('checked', true);
              
              // Populate time
              $("#start-time").val(classData.start_time);
              $("#end-time").val(classData.end_time);
              
              // Populate day
              $(`input[name="day-id"][value="${classData.class_day}"]`).prop('checked', true);
              
              // Populate room
              const roomValue = `${classData.room_code}|${classData.room_no}`;
              roomId.val(roomValue);
              const roomOption = roomList.find(`[data-value="${roomValue}"]`);
              if (roomOption.length > 0) {
                roomText.val(roomOption.text());
              }
            }
          },
          error: function() {
            console.log("Failed to fetch class details");
          }
        });

        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal);
        }); 

        $("#form-edit").on("submit", function (e) {
          e.preventDefault();
          updateroomStatus();
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
    console.log("deleteconfirmationStatus called with:", { classID, subType, classDay });
    alert(`deleteconfirmationStatus called: classID=${classID}, subType=${subType}, classDay=${classDay}`);
    
    return $.ajax({
      type: "GET", // Use GET request
      url: "../class-room-status/delete-confirmation-status.html?v=" + new Date().getTime(), // URL to get product data
      dataType: "html", // Expect JSON response
      success: function (view) {
        console.log("Delete modal loaded successfully");
        // Assuming 'view' contains the new content you want to display
        $(".modal-container").empty().html(view); // Load the modal view
        $("#staticBackdrop").modal("show"); // Show the modal
        $("#staticBackdroped").attr("data-id");

        const modal = $('#staticBackdrop');
        
        // Directly populate form fields with the data we already have
        console.log("Populating form fields:", { classID, subType, classDay });
        $("#class-id").val(classID);
        $("#subject-type").val(subType);
        $("#class-day").val(classDay);
        
        console.log("Form values after setting:", {
          classId: $("#class-id").val(),
          subjectType: $("#subject-type").val(), 
          classDay: $("#class-day").val()
        });
        
        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the delete form submission
        $("#form-delete").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          deleteroomStatus(); // Call function to delete room status
        });
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
  }

  //Load delete modal for class details
  function deleteconfirmationClassDetails(classID, subType){
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
        
        // Directly populate form fields with the data we already have
        $("#class-id").val(classID);
        $("#subject-type").val(subType);
        $("#class-day").val(''); // Class details don't need day
        
        $(".modal-close").on("click", function (e) {
          e.preventDefault();
          closeModal(modal); // Pass modal to closeModal function
        }); 

        // Event listener for the delete form submission
        $("#form-delete").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          deleteclassDetails(); // Call function to delete class details
        });
      },
      error: function (xhr, status, error) {
        alert("An error occurred while loading the modal: " + error);
      }
    });
  }

  function deleteroomStatus(){
    console.log("deleteroomStatus function called");
    alert("deleteroomStatus function called");
    
    const submitButton = $("#form-delete button[type='submit']");
    submitButton.prop('disabled', true);
    // Debug what's being sent
    const formdeleteClassStatus = $("#form-delete").serialize();
    console.log("Sending data:", formdeleteClassStatus);
    // alert(`Sending data: ${formdeleteClassStatus}`); // Removed debug alert
    
    $.ajax({
      type: "POST", // Use POST request
      url: "../class-room-status/delete-room-status.php", // URL for saving room
      data: formdeleteClassStatus, // Serialize the form data for submission, Add ID to form data
      dataType: "json", // Expect JSON response
      beforeSend: function(xhr) {
        console.log("About to send AJAX request to: ../class-room-status/delete-room-status.php");
        console.log("Data being sent:", formdeleteClassStatus);
        console.log("XHR object:", xhr);
      },
      success: function (response) {
       console.log("Delete response:", response);
       // alert(`Delete response: ${JSON.stringify(response)}`); // Removed debug alert
       if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("#form-delete")[0].reset(); // Reset the form
          
          // Refresh both class status list and scheduled table
          viewroomStatus(); // Refresh class status list
          
          // If we're on the schedule tab, refresh it too
          if ($(".content-page").find("#schedule-room").length > 0) {
            // We're on the schedule tab, refresh the schedule
            const currentRoom = $("#schedule-room").val();
            const currentDay = $("#schedule-day").val();
            if (currentRoom && currentDay) {
              fetchSchedule(); // Refresh the schedule grid
            }
          }
        }
      },
      error: function (xhr, status, error) {
        console.log("Delete error:", status, error);
        console.log("XHR status:", xhr.status);
        console.log("XHR responseText:", xhr.responseText);
        alert(`Delete error: ${status} - ${error}`);
        alert(`XHR status: ${xhr.status}, responseText: ${xhr.responseText}`);
        alert('Failed to load delete-room-status.php.');
        console.error("Error deleting class schedule status:", status, error);
      },
      complete: function(xhr) {
        console.log("AJAX request completed");
        console.log("Final XHR status:", xhr.status);
        console.log("Final XHR responseText:", xhr.responseText);
      }

    });
  }
   //function to fetch room name, goes to roomlist folder, fetch-room-name
   function customDropdown(optionText, dropdownId, optionId, fetchUrl, appendOptionsCallback) {
    const dropdownList = dropdownId;
    
    console.log('Initializing customDropdown for:', fetchUrl);
    console.log('Elements found:', {
        optionText: optionText.length,
        dropdownId: dropdownId.length,
        optionId: optionId.length
    });

    // Fetch data for the dropdown
    $.ajax({
        url: fetchUrl,
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log('Data received from', fetchUrl, ':', data);
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
                // Clear the hidden input when user types to force selection from dropdown
                optionId.val('');
                filterItems();
            });

            // Select an item and update the input value
            dropdownList.on('click', 'div', function(event) {
                event.stopPropagation();
                const selectedText = $(this).text();
                const selectedValue = $(this).data('value');
                
                console.log('Teacher selected - Text:', selectedText, 'Value:', selectedValue);
                console.log('Setting optionId:', optionId.attr('id'), 'to value:', selectedValue);
                
                optionText.val(selectedText);
                optionId.val(selectedValue);
                dropdownList.hide();
                
                console.log('After setting - optionId value:', optionId.val());
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

                // Show "No results found" if no items match
                if (!hasVisibleItems && filter !== '') {
                    if (!dropdownList.children('.no-results').length) {
                        dropdownList.append('<div class="no-results" style="padding: 8px; color: #999;">No results found</div>');
                    }
                } else {
                    dropdownList.children('.no-results').remove();
                }
            }

            // Close dropdown when clicking outside
            $(document).on('click', function(event) {
                if (!$(event.target).closest('.dropdown').length) {
                    dropdownList.hide();
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching data from', fetchUrl, ':', error);
            console.error('Response text:', xhr.responseText);
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

});
