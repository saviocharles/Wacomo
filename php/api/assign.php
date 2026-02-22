<?php
header('Content-Type: application/json');
require_once '../includes/config.php';
require_once '../includes/db.php';
require_once '../includes/functions.php';

check_auth('ADMIN');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $commodityId = $_POST['commodity_id'] ?? '';
    $userId = $_POST['user_id'] ?? '';

    if (empty($commodityId) || empty($userId)) {
        echo json_encode(['error' => 'Missing ID fields']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Create assignment
        $stmt = $pdo->prepare("INSERT INTO assignments (id, commodity_id, user_id, status) VALUES (?, ?, ?, 'ASSIGNED')");
        $stmt->execute([generate_uuid(), $commodityId, $userId]);

        // Update commodity status
        $stmt = $pdo->prepare("UPDATE commodities SET status = 'ASSIGNED' WHERE id = ?");
        $stmt->execute([$commodityId]);

        log_action($_SESSION['user_id'], 'ASSIGNED', "Assigned commodity $commodityId to user $userId", $commodityId);

        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => 'Assignment failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Method not allowed']);
}
