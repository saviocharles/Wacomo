<?php
header('Content-Type: application/json');
require_once '../includes/config.php';
require_once '../includes/db.php';
require_once '../includes/functions.php';

check_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawMessage = trim($_POST['message'] ?? '');
    $sender = trim($_POST['sender'] ?? 'Simulator');
    
    if (empty($rawMessage)) {
        echo json_encode(['error' => 'Message is empty']);
        exit;
    }

    $parsed = parse_message($rawMessage);
    $commodityId = generate_uuid();
    
    $stmt = $pdo->prepare("INSERT INTO commodities (id, raw_message, sender, parsed_name, location, rate, quantity, unit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $status = $parsed['isParsed'] ? 'PENDING' : 'UNIDENTIFIED';
    
    $result = $stmt->execute([
        $commodityId,
        $rawMessage,
        $sender,
        $parsed['commodity'],
        $parsed['location'],
        $parsed['rate'],
        $parsed['quantity'],
        $parsed['unit'],
        $status
    ]);

    if ($result) {
        log_action($_SESSION['user_id'], 'CREATED', "Received message: $rawMessage", $commodityId);
        echo json_encode([
            'success' => true, 
            'data' => array_merge($parsed, ['id' => $commodityId, 'status' => $status])
        ]);
    } else {
        echo json_encode(['error' => 'Failed to save commodity']);
    }
} else {
    echo json_encode(['error' => 'Method not allowed']);
}
