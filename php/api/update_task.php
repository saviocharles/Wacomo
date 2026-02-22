<?php
header('Content-Type: application/json');
require_once '../includes/config.php';
require_once '../includes/db.php';
require_once '../includes/functions.php';

check_auth('USER');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $assignmentId = $_POST['assignment_id'] ?? '';
    $status = $_POST['status'] ?? '';
    $quantity = $_POST['updated_quantity'] ?? null;
    $rate = $_POST['updated_rate'] ?? null;
    $remarks = $_POST['user_remarks'] ?? '';

    if (empty($assignmentId) || empty($status)) {
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Update assignment
        $stmt = $pdo->prepare("
            UPDATE assignments 
            SET status = ?, updated_quantity = ?, updated_rate = ?, user_remarks = ?, updated_at = NOW() 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$status, $quantity, $rate, $remarks, $assignmentId, $_SESSION['user_id']]);

        // If completed, update the commodity status too
        if ($status === 'COMPLETED') {
            $stmt = $pdo->prepare("
                UPDATE commodities c
                JOIN assignments a ON a.commodity_id = c.id
                SET c.status = 'COMPLETED'
                WHERE a.id = ?
            ");
            $stmt->execute([$assignmentId]);
        }

        log_action($_SESSION['user_id'], 'STATUS_CHANGED', "Updated task $assignmentId to $status. Remarks: $remarks", null, $assignmentId);

        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => 'Update failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Method not allowed']);
}
