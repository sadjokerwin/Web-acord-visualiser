<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../models/Song.php';

if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'Song ID is required']);
    exit;
}

$songId = $_GET['id'];
$songModel = new Song();

$songInfo = $songModel->getSongById($songId);
$chords = $songModel->getSongChords($songId);

$response = [
    'song' => $songInfo,
    'chords' => $chords
];

echo json_encode($response);
?>
