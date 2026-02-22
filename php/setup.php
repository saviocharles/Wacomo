<?php
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/functions.php';

echo "<h2>System Setup</h2>";

try {
    // Create admin user if not exists
    $adminEmail = 'admin@wacomo.com';
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    
    if (!$stmt->fetch()) {
        $userId = generate_uuid();
        $password = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, 'System Admin', ?, ?, 'ADMIN')");
        $stmt->execute([$userId, $adminEmail, $password]);
        echo "<p style='color: green;'>✅ Default Admin Created:<br>Email: <b>$adminEmail</b><br>Password: <b>admin123</b></p>";
    } else {
        echo "<p style='color: blue;'>ℹ️ Admin user already exists.</p>";
    }

} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Setup failed: " . $e->getMessage() . "</p>";
}

echo "<p><a href='login.php'>Go to Login</a></p>";
?>
