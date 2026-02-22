<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'wacomo');
define('DB_USER', 'root');
define('DB_PASS', '');

// App Configuration
define('APP_NAME', 'WhatsApp Commodity Sourcing');
define('BASE_URL', 'http://localhost/wacomo');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
