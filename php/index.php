<?php
require_once 'includes/config.php';
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'ADMIN') {
        header("Location: admin_dashboard.php");
    } else {
        header("Location: user_dashboard.php");
    }
} else {
    header("Location: login.php");
}
exit;
