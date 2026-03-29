<!DOCTYPE html>
<html>
<head>
    <title>Debug Buttons</title>
    <script src="vendor/bootstrap-5.3.3/js/bootstrap.bundle.min.js"></script>
    <script src="vendor/jquery-3.7.1/jquery-3.7.1.min.js"></script>
</head>
<body>
    <h1>Debug Button Functionality</h1>
    
    <button class="room-schedule" onclick="testClick()">Test Schedule Button</button>
    
    <div id="debug-output"></div>
    
    <script>
        function testClick() {
            console.log("Button clicked!");
            document.getElementById('debug-output').innerHTML = "Button was clicked!";
        }
        
        $(document).ready(function() {
            console.log("jQuery loaded");
            
            $(".room-schedule").on("click", function (e) {
                e.preventDefault();
                console.log("Schedule button clicked via jQuery");
                alert("Schedule button clicked!");
            });
        });
    </script>
    
    <script src="js/admin.js"></script>
</body>
</html>
