<?php
require_once 'config.php';

$query = $_GET['query'] ?? '';

try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASS);
    
    $stmt = $pdo->prepare("
        SELECT s.title, s.artist, c.chord_name, c.tab_data 
        FROM songs s 
        JOIN chords c ON s.id = c.song_id 
        WHERE s.title LIKE ? 
        ORDER BY c.position_order ASC
    ");
    $stmt->execute(["%$query%"]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($results);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}