<?php
$page_title = "CodeLuck - Sign Up";
include_once "../includes/_head.php";
require_once '../tools/functions.php';
require_once '../classes/account.class.php';

session_start();

$accountObj = new Account();

$generalErr = '';
$generalErrDisplay = FALSE;

$user_id = $first_name = $last_name = $username = $password = $confirm_password = '';
$user_idErr = $first_nameErr = $last_nameErr = $usernameErr = $passwordErr = $confirm_passwordErr = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST'){
    $user_id = clean_input($_POST['user-id']);
    $first_name = clean_input($_POST['firstname']);
    $last_name = clean_input($_POST['lastname']);
    $username = clean_input($_POST['username']);
    $password = clean_input($_POST['password']);
    $confirm_password = clean_input($_POST['confirm_password']);

    
    if (empty($user_id)) {
        $user_idErr = "Student ID is Required!";
    }

    if (empty($first_name)) {
        $first_nameErr = "First name is Required!";
    }
    if (empty($last_name)) {
        $last_nameErr = "Last name is Required!";
    }
    
    if (empty($username)) {
        $usernameErr = "username is Required!";
    }
    
    // elseif ($accountObj->usernameExist($user_id, $username)) {
    //     $usernameErr = "This username does not exist within the list.";
    // }

    if(empty($password)) {
        $passwordErr = "password is Required!";
    }
    
    if(empty($confirm_password)) {
        $confirm_passwordErr = "Please confirm your password!";
    } elseif($password !== $confirm_password) {
        $confirm_passwordErr = "Passwords do not match!";
    }

    if($accountObj->useridExist($user_id)) {
        $generalErrDisplay = TRUE;
        $generalErr = "This student ID already has an Account!";
        $user_idErr = "Invalid";
    }elseif($accountObj->userExist($user_id)){
        $generalErrDisplay = TRUE;
        $generalErr = "This student ID is not registered, pls contact an admin to register your ID.";
    }elseif($accountObj->checkusernameMatch($user_id, $username)){
        $generalErrDisplay = TRUE;
        $generalErr = "This username did not match with your student ID.";
        $usernameErr = "Invalid";
    }

    if (empty($generalErr) && empty($user_idErr) && empty($first_nameErr) && empty($last_nameErr) && empty($usernameErr) && empty($passwordErr) && empty($confirm_passwordErr)) {
        $accountObj->account_id = $user_id;
        $accountObj->first_name = $first_name;
        $accountObj->last_name = $last_name;
        $accountObj->username = $username;
        $accountObj->password = $password;
        $accountObj->add();
        header("location: loginwcss.php");
        exit();
    }

    
}
?>
<style>
    .hidden{
        display: none;
    }

    .borderErr{
        border: 1px solid red;
    }
    
    .bd-placeholder-img {
        font-size: 1.125rem;
        text-anchor: middle;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
    }

    @media (min-width: 768px) {
        .bd-placeholder-img-lg {
            font-size: 3.5rem;
        }
    }

    .b-example-divider {
        width: 100%;
        height: 3rem;
        background-color: rgba(0, 0, 0, 0.1);
        border: solid rgba(0, 0, 0, 0.15);
        border-width: 1px 0;
        box-shadow: inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1),
            inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
    }

    .b-example-vr {
        flex-shrink: 0;
        width: 1.5rem;
        height: 100vh;
    }

    .bi {
        vertical-align: -0.125em;
        fill: currentColor;
    }

    .nav-scroller {
        position: relative;
        z-index: 2;
        height: 2.75rem;
        overflow-y: hidden;
    }

    .nav-scroller .nav {
        display: flex;
        flex-wrap: nowrap;
        padding-bottom: 1rem;
        margin-top: -1px;
        overflow-x: auto;
        text-align: center;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
    }

    .btn-bd-primary {
        --bd-violet-bg: #712cf9;
        --bd-violet-rgb: 112.520718, 44.062154, 249.437846;

        --bs-btn-font-weight: 600;
        --bs-btn-color: var(--bs-white);
        --bs-btn-bg: var(--bd-violet-bg);
        --bs-btn-border-color: var(--bd-violet-bg);
        --bs-btn-hover-color: var(--bs-white);
        --bs-btn-hover-bg: #6528e0;
        --bs-btn-hover-border-color: #6528e0;
        --bs-btn-focus-shadow-rgb: var(--bd-violet-rgb);
        --bs-btn-active-color: var(--bs-btn-hover-color);
        --bs-btn-active-bg: #5a23c8;
        --bs-btn-active-border-color: #5a23c8;
    }

    .btn{
        color: var(--bs-btn-color);
    }

    /* Keep Sign Up button color unchanged on hover */
    .form-signin .btn-primary{
        --bs-btn-hover-bg: var(--bs-btn-bg);
        --bs-btn-hover-border-color: var(--bs-btn-border-color);
        --bs-btn-hover-color: var(--bs-btn-color);
    }
    .form-signin .btn-primary,
    .form-signin .btn-primary:hover,
    .form-signin .btn-primary:focus,
    .form-signin .btn-primary:active,
    .form-signin .btn-primary:focus-visible{
        background-color: var(--bs-btn-bg) !important;
        border-color: var(--bs-btn-border-color) !important;
        color: var(--bs-btn-color) !important;
        box-shadow: none;
    }

    .bd-mode-toggle {
        z-index: 1500;
    }

    .bd-mode-toggle .dropdown-menu .active .bi {
        display: block !important;
    }

    html,
    body {
        height: 100%;
    }

    .bg-body-tertiary {
    
    background-color: rgba(var(--bs-tertiary-bg-rgb), var(--bs-bg-opacity)) !important;
    }

    

    /* signin background target */
    .bg-body-tertiary{
        background-color: rgba(44, 59, 20, 1) !important; 
    }

    .form-signin {
        max-width: 400px;
        padding: 2rem;
        --bs-bg-opacity: 1;
        --bs-tertiary-bg-rgb: 248, 249, 250;
        background-color: rgba(var(--bs-tertiary-bg-rgb), var(--bs-bg-opacity)) !important;
        border-radius: 24px;
    }

    .form-signin .form-floating:focus-within {
        z-index: 2;
    }

    .form-signin input[type="email"] {
        margin-bottom: -1px;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    .form-signin input[type="password"] {
        margin-bottom: 10px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }
    
    .form-floating .input-group {
        margin-bottom: 1rem;
        position: relative;
        height: 3.6rem;
    }

    .form-floating .input-group > .form-control {
        padding-right: 2.5rem;
        height: 100%;
    }

    .form-floating .input-group > label {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        height: 100%;
        padding: 1rem 0.75rem;
        padding-right: 2.5rem;
        pointer-events: none;
        border: 1px solid transparent;
        transform-origin: 0 0;
        transition: opacity .1s ease-in-out,transform .1s ease-in-out;
        display: flex;
        align-items: center;
        line-height: 1.5;
    }
    
    .form-floating .input-group > .form-control:not(:placeholder-shown) ~ label,
    .form-floating .input-group:focus-within > label {
        opacity: 0;
        transform: scale(.85) translateY(-0.5rem) translateX(0.15rem);
        pointer-events: none;
    }

    .input-group-text {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        z-index: 5;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
        width: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        background-color: transparent;
        border: none;
    }

    .input-group-text i {
        font-size: 0.875rem;
        vertical-align: middle;
        line-height: 1;
        margin: 0;
        color: #6c757d;
    }
</style>

<body class="d-flex align-items-center py-4 bg-body-tertiary">

    <main class="form-signin w-100 m-auto">
        <form action="signup.php" method="post">
            <img class="mb-4" src="../img/box.png" alt="" width="72" height=72">

            <h1 class="h3 mb-3 fw-normal">Sign Up</h1>

            <div class="form-floating <?php echo $generalErrDisplay ? '' : 'hidden';  ?>">
                <p class="form-control text-danger"><?= $generalErr?></p>
            </div>

            <div class="form-floating">
                <input type="text" class="form-control <?= $user_idErr == '' ? '' : 'borderErr'; ?>" id="user-id" name="user-id" placeholder="202401234" value="<?= $user_id //qb2021 01863?>">
                <label for="user-id">Student ID</label>
                <p class="text-danger"><?= $user_idErr?></p>
            </div>

            <div class="form-floating">
                <input type="text" class="form-control <?= $first_nameErr == '' ? '' : 'borderErr'; ?>" id="firstname" name="firstname" placeholder="Firstname" value="<?= $first_name ?>">
                <label for="firstname">First name</label>
                <p class="text-danger"><?= $first_nameErr ?></p>
            </div>

            <div class="form-floating">
                <input type="text" class="form-control <?= $last_nameErr == '' ? '' : 'borderErr'; ?>" id="lastname" name="lastname" placeholder="Lastname" value="<?= $last_name ?>">
                <label for="lastname">Last name</label>
                <p class="text-danger"><?= $last_nameErr ?></p>
            </div>
          
            <div class="form-floating">
                <input type="text" class="form-control <?= $usernameErr == '' ? '' : 'borderErr'; ?>" id="username" name="username" placeholder="Username" value="<?= $username ?>">
                <label for="username">Username</label>
                <p class="text-danger"><?= $usernameErr ?></p>
            </div>

            <div class="form-floating">
                <div class="input-group">
                    <input type="password" class="form-control <?= $passwordErr == '' ? '' : 'borderErr'; ?>" id="password" name="password">
                    <div class="input-group-text" style="cursor: pointer;" id="toggle-password">
                        <i class="bi bi-eye" id="password-eye"></i>
                    </div>
                </div>
                <label for="password">Password</label>
                <p class="text-danger"><?= $passwordErr ?></p>
            </div>

            <div class="form-floating">
                <div class="input-group">
                    <input type="password" class="form-control <?= $confirm_passwordErr == '' ? '' : 'borderErr'; ?>" id="confirm_password" name="confirm_password">
                    <div class="input-group-text" style="cursor: pointer;" id="toggle-confirm-password">
                        <i class="bi bi-eye" id="confirm-password-eye"></i>
                    </div>
                </div>
                <label for="confirm_password">Confirm Password</label>
                <p class="text-danger"><?= $confirm_passwordErr ?></p>
            </div>

            <button class="btn btn-primary w-100 py-2" type="submit">Sign Up</button>
            <button class="btn btn-outline-secondary w-100 py-2 mt-2" type="button" onclick="history.back()">Back</button>
            <p class="mt-5 mb-3 text-body-secondary">&copy; 2025–2026</p>
        </form>
    </main>
    
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
        
        document.getElementById('toggle-confirm-password').addEventListener('click', function() {
            const confirmPasswordInput = document.getElementById('confirm_password');
            const confirmPasswordEye = document.getElementById('confirm-password-eye');
            
            if (confirmPasswordInput.type === 'password') {
                confirmPasswordInput.type = 'text';
                confirmPasswordEye.classList.remove('bi-eye');
                confirmPasswordEye.classList.add('bi-eye-slash');
            } else {
                confirmPasswordInput.type = 'password';
                confirmPasswordEye.classList.remove('bi-eye-slash');
                confirmPasswordEye.classList.add('bi-eye');
            }
        });
        
        // Handle label transformation for password fields
        function handleLabelTransform(inputId) {
            const input = document.getElementById(inputId);
            const label = input.parentElement.nextElementSibling;
            
            function updateLabel() {
                if (input.value.length > 0) {
                    label.style.opacity = '0';
                    label.style.transform = 'scale(.85) translateY(-0.5rem) translateX(0.15rem)';
                    label.style.pointerEvents = 'none';
                } else {
                    label.style.opacity = '';
                    label.style.transform = '';
                    label.style.pointerEvents = '';
                }
            }
            
            input.addEventListener('input', updateLabel);
            input.addEventListener('focus', updateLabel);
            input.addEventListener('blur', updateLabel);
        }
        
        // Initialize label handling for both password fields
        handleLabelTransform('password');
        handleLabelTransform('confirm_password');
    </script>
    
    <?php
    require_once '../includes/_footer.php';
    ?>
</body>

</html>