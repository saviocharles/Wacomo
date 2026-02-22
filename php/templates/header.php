<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . ' - ' . APP_NAME : APP_NAME; ?></title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts: Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark-glass {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen">
    <?php if (isset($_SESSION['user_id'])): ?>
    <nav class="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Wacomo
                    </span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-slate-600">
                        Hello, <strong><?php echo htmlspecialchars($_SESSION['name']); ?></strong>
                    </span>
                    <a href="logout.php" class="text-sm font-medium text-red-600 hover:text-red-700">Logout</a>
                </div>
            </div>
        </div>
    </nav>
    <?php endif; ?>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
