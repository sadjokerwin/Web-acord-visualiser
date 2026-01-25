<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../models/Song.php';

$song = new Song();
$songs = $song->getAllSongs();

echo json_encode($songs);
?>
