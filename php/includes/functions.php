<?php
require_once 'db.php';

/**
 * Parse WhatsApp message for commodity details
 */
function parse_message($text) {
    $result = [
        'commodity' => null,
        'location' => null,
        'rate' => null,
        'quantity' => null,
        'unit' => null,
        'isParsed' => false
    ];

    $cleanedText = strtolower($text);

    // Quantity Regex
    if (preg_match('/(\d+(?:\.\d+)?)\s*(tons?|mt|kg|quintals?|qtl)/i', $cleanedText, $matches)) {
        $result['quantity'] = (float)$matches[1];
        $result['unit'] = $matches[2];
    }

    // Rate Regex
    if (preg_match('/(?:at|@|rate|rs\.?)\s*(\d+(?:\.\d+)?)/i', $cleanedText, $matches)) {
        $result['rate'] = (float)$matches[1];
    }

    // Location Regex
    if (preg_match('/(?:in|at|for|from|site)\s+([a-zA-Z\s]+?)(?:\s+(?:at|@|rate|qty|quantity|rs\.?)|$)/i', $cleanedText, $matches)) {
        $result['location'] = trim($matches[1]);
    }

    // Commodity Keywords
    $knownCommodities = ['soybean', 'wheat', 'rice', 'maize', 'sugar', 'onion', 'tomato', 'oil', 'cotton'];
    foreach ($knownCommodities as $commodity) {
        if (strpos($cleanedText, $commodity) !== false) {
            $result['commodity'] = ucfirst($commodity);
            break;
        }
    }

    // Fallback Commodity Regex
    if (!$result['commodity']) {
        if (preg_match('/(?:of|need|buy|sell|require|looking|urgent)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:in|at|for|from|@|rate|qty|rs\.?)|$)/i', $cleanedText, $matches)) {
            $result['commodity'] = trim($matches[1]);
        }
    }

    if ($result['commodity'] || $result['location'] || $result['rate'] || $result['quantity']) {
        $result['isParsed'] = true;
    }

    return $result;
}

/**
 * Auth Middleware equivalent
 */
function check_auth($requiredRole = null) {
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit;
    }

    if ($requiredRole && $_SESSION['role'] !== $requiredRole) {
        die("Unauthorized access");
    }
}

/**
 * Audit Log Helper
 */
function log_action($userId, $action, $details = null, $commodityId = null, $assignmentId = null) {
    global $pdo;
    $stmt = $pdo->prepare("INSERT INTO audit_logs (id, user_id, action, details, commodity_id, assignment_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([generate_uuid(), $userId, $action, $details, $commodityId, $assignmentId]);
}
