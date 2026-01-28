<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../models/Database.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['song_id']) || !isset($input['lyrics'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$songId = $input['song_id'];
$lyrics = $input['lyrics'];

try {
    $database = new Database();
    $pdo = $database->getConnection();

    $stmt = $pdo->prepare("UPDATE songs SET lyrics = ? WHERE id = ?");
    $stmt->execute([$lyrics, $songId]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>