<?php
$page_title = "Login";
include_once '../includes/_login_head.php';
require_once '../tools/functions.php';
require_once '../classes/account.class.php';

session_start();

$username = $password = '';
$accountObj = new Account();
$loginErr = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = clean_input($_POST['username']);
    $password = clean_input($_POST['password']);

    error_log("Login attempt - Username: " . $username);

    if($accountObj->login($username, $password)) {
        $data = $accountObj->fetch($username);
        error_log("Login successful - User data: " . print_r($data, true));
        
        if ($data && ($data['is_staff'] == 1 || $data['is_admin'] == 1)) {
            $_SESSION['account'] = $data;
            error_log("Admin/Staff session set, redirecting to admin");
            header('location: ../admin/room-list.php');
            exit();
        } else {
            $_SESSION['account'] = $data;
            // Set default semester for students if not already set
            if (!isset($_SESSION['selected_semester_id'])) {
                $_SESSION['selected_semester_id'] = '1|2024-2025'; // Default semester
                $_SESSION['semester_picked'] = true;
            }
            error_log("Student session set, redirecting to view page");
            header('location: ../class-room-status/viewclass-status.php');
            exit();
        }
    }else{
        error_log("Login failed");
        $loginErr = 'Invalid username/password';
    }

} else {
    if (isset($_SESSION['account'])) {
        if ($_SESSION['account']['is_staff'] || $_SESSION['account']['is_admin']) {
            header('location: ../admin/room-list.php');
        } else {
            header('location: ../class-room-status/viewclass-status.php');
        }
    }
}
?>
<style>
    .input-group {
        position: relative;
        width: 100%;
    }

    .input-group .input {
        padding-right: 2.5rem !important;
    }

    .input-group-text {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        z-index: 5;
        border: none;
        width: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        background-color: transparent;
        cursor: pointer;
        pointer-events: auto;
    }

    .input-group-text i {
        font-size: 1rem !important;
        line-height: 1;
        margin: 0;
        color: #6c757d !important;
        display: block !important;
        width: 16px;
        height: 16px;
    }
</style>

<body>
        <form action="loginwcss.php" method="post" class="form">

            <img class="mb-4" src="../img/box.png" alt="" width="128px" height="128px">
            <h1>ROOM UTILIZATION</h1>
            <!-- <h2 class="h3 mb-3 fw-normal">Login</h2> -->

            <div class="input-Container">
                <label for="username" class="blabel">Username</label>
                <input type="text" class="input" id="username" autocomplete="username" name="username" placeholder="Username">
            </div>

            <div class="input-Container">
                <label for="password" class="blabel">Password</label>
                <div class="input-group">
                    <input type="password" class="input" id="password" name="password" placeholder="Password">
                    <div class="input-group-text" style="cursor: pointer;" id="toggle-password">
                        <i class="bi bi-eye" id="password-eye"></i>
                    </div>
                </div>
            </div>

            <p class="text-danger"><?= $loginErr ?></p>
            <button  class="buttonContinue" type="submit">Continue</button>
            <div class="form-check text-start my-3">
                <input class="form-check-input" type="checkbox" value="remember-me" id="flexCheckDefault">
                <label class="form-check-label" for="flexCheckDefault">
                    Remember me
                </label>
            </div>
            <div class="signupContainer">
                <a class="text-link" href="signup.php">Create an Account</a>
            </div>

            <p class="mt-5 mb-3 text-body-secondary">&copy; 2025–2026</p>
        </form>
        
        <script>
            // Password visibility toggle functionality
            document.getElementById('toggle-password').addEventListener('click', function() {
                const passwordInput = document.getElementById('password');
                const passwordEye = document.getElementById('password-eye');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    passwordEye.classList.remove('bi-eye');
                    passwordEye.classList.add('bi-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    passwordEye.classList.remove('bi-eye-slash');
                    passwordEye.classList.add('bi-eye');
                }
            });
        </script>
    <?php
    require_once '../includes/_footer.php';
    ?>
</body>

</html>