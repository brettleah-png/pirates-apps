<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = htmlspecialchars($_POST htmlspecialchars($_POST['email']);
    $password = htmlspecialchars($_POST['password']);

    // Here you can add code to save the data to a database or perform other actions

    echo "Sign up successful! Welcome, " . $username . "!";
}
?>