<?php
// backend/save_imported_song.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../models/Database.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Невалидни данни']);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    $pdo->beginTransaction();

    // 1. Запис на песента
    $stmt = $pdo->prepare("INSERT INTO songs (title, artist, lyrics, soundcloud_url) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['title'], $data['artist'], $data['lyrics'] ?? '', $data['soundcloud_url'] ?? '']);
    $songId = $pdo->lastInsertId();

    // 2. Запис на акордите
    if (isset($data['chords']) && is_array($data['chords'])) {
        $chordStmt = $pdo->prepare("INSERT INTO chords (song_id, chord_name, tab_data, position_order) VALUES (?, ?, ?, ?)");
        foreach ($data['chords'] as $chord) {
            $chordStmt->execute([
                $songId,
                $chord['name'],
                $chord['tab'],
                $chord['position'] ?? 0
            ]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    if ($pdo)
        $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>