<?php
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/functions.php';

$pageTitle = "Register";
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $role = $_POST['role'] ?? 'USER';

    if (empty($name) || empty($email) || empty($password)) {
        $error = "All fields are required.";
    } else {
        // Check if email exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = "Email already registered.";
        } else {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $userId = generate_uuid();
            
            $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
            if ($stmt->execute([$userId, $name, $email, $hashedPassword, $role])) {
                $success = "Registration successful! You can now <a href='login.php' class='underline'>login</a>.";
            } else {
                $error = "Something went wrong. Please try again.";
            }
        }
    }
}

include 'templates/header.php';
?>

<div class="max-w-md mx-auto">
    <div class="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Create Account</h2>
        
        <?php if ($error): ?>
            <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <?php if ($success): ?>
            <div class="bg-green-50 text-green-600 p-4 rounded-lg mb-6 text-sm border border-green-100">
                <?php echo $success; ?>
            </div>
        <?php endif; ?>

        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" name="name" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" name="email" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" name="password" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select name="role" class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                    <option value="USER">User (Sourcing Team)</option>
                    <option value="ADMIN">Administrator</option>
                </select>
            </div>
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all">
                Register
            </button>
        </form>
        
        <p class="mt-6 text-center text-sm text-slate-600">
            Already have an account? <a href="login.php" class="text-blue-600 font-medium hover:underline">Login here</a>
        </p>
    </div>
</div>

<?php include 'templates/footer.php'; ?>
