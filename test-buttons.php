<!DOCTYPE html>
<html>
<head>
    <title>Test Buttons</title>
    <script src="vendor/jquery-3.7.1/jquery-3.7.1.min.js"></script>
    <script src="vendor/bootstrap-5.3.3/js/bootstrap.bundle.min.js"></script>
</head>
<body>
    <h1>Test Button Functionality</h1>
    
    <table>
        <tr>
            <td>CALC138</td>
            <td>BSCS3A</td>
            <td>Teacher 1</td>
            <td>
                <a href="#" class="btn room-schedule">Schedule</a>
                <a href="#" class="btn room-status">Occupy</a>
            </td>
        </tr>
    </table>
    
    <div id="output"></div>
    
    <script>
        $(document).ready(function() {
            console.log("Document ready, binding events...");
            
            $(".room-schedule").on("click", function (e) {
                e.preventDefault();
                console.log("Schedule button clicked!");
                alert("Schedule button works!");
                $("#output").html("Schedule button was clicked!");
            });
            
            $(".room-status").on("click", function(e){
                e.preventDefault();
                console.log("Occupy button clicked!");
                alert("Occupy button works!");
                $("#output").html("Occupy button was clicked!");
            });
        });
    </script>
</body>
</html>
