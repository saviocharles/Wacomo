<?php
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/functions.php';

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'ADMIN') {
        header("Location: admin_dashboard.php");
    } else {
        header("Location: user_dashboard.php");
    }
    exit;
}

$pageTitle = "Login";
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    if (empty($email) || empty($password)) {
        $error = "Please fill in all fields.";
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['role'] = $user['role'];
            
            if ($user['role'] === 'ADMIN') {
                header("Location: admin_dashboard.php");
            } else {
                header("Location: user_dashboard.php");
            }
            exit;
        } else {
            $error = "Invalid email or password.";
        }
    }
}

include 'templates/header.php';
?>

<div class="max-w-md mx-auto">
    <div class="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
        <p class="text-slate-500 mb-8 text-sm">Sign in to manage commodity sourcing</p>
        
        <?php if ($error): ?>
            <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" name="email" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="admin@example.com">
            </div>
            <div>
                <div class="flex justify-between mb-1">
                    <label class="block text-sm font-medium text-slate-700">Password</label>
                    <a href="#" class="text-xs text-blue-600 hover:underline">Forgot password?</a>
                </div>
                <input type="password" name="password" required class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="••••••••">
            </div>
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all">
                Sign In
            </button>
        </form>
        
        <p class="mt-6 text-center text-sm text-slate-600">
            Don't have an account? <a href="register.php" class="text-blue-600 font-medium hover:underline">Register now</a>
        </p>
    </div>
</div>

<?php include 'templates/footer.php'; ?>
