<?php
$host = 'localhost';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("CREATE DATABASE IF NOT EXISTS chord_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE chord_project");

    $pdo->exec("CREATE TABLE IF NOT EXISTS songs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS chords (
        id INT AUTO_INCREMENT PRIMARY KEY,
        song_id INT,
        chord_name VARCHAR(50),
        tab_data TEXT,
        position_order INT,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    )");


    $stmt = $pdo->prepare("INSERT IGNORE INTO songs (id, title, artist) VALUES (1, 'Mistreated', 'Deep Purple')");
    $stmt->execute();
    $songId = 1;

    $chordsMistreated = [
        ['F#m', '244222', 0],
        ['E/G#', '4x245x', 1],
        ['D/A', 'x04232', 2],
        ['Bm', 'x24432', 3]
    ];

    $stmt = $pdo->prepare("INSERT IGNORE INTO chords (song_id, chord_name, tab_data, position_order) VALUES (?, ?, ?, ?)");
    foreach ($chordsMistreated as $chord) {
        $stmt->execute([$songId, $chord[0], $chord[1], $chord[2]]);
    }

    $stmt = $pdo->prepare("INSERT IGNORE INTO songs (id, title, artist) VALUES (2, 'Stairway to Heaven', 'Led Zeppelin')");
    $stmt->execute();
    $songId = 2;

    $chordsStairwayHeaven = [
        ['Am', 'x02210', 0],
        ['G#aug', 'xx6454', 1],
        ['C/G', 'xx555x', 2],
        ['D/F#', 'xx4232', 3],
        ['Fmaj7', 'xx3210', 4]
    ];

    $stmt = $pdo->prepare("INSERT IGNORE INTO chords (song_id, chord_name, tab_data, position_order) VALUES (?, ?, ?, ?)");
    foreach ($chordsStairwayHeaven as $chord) {
        $stmt->execute([$songId, $chord[0], $chord[1], $chord[2]]);
    }

    $stmt = $pdo->prepare("INSERT IGNORE INTO songs (id, title, artist) VALUES (3, 'Hotel California', 'Eagles')");
    $stmt->execute();
    $songId = 3;

    $chordHotelCalifornia = [
        ['Bm', 'x24432', 0],
        ['F#7', '242322', 1],
        ['A', 'x02220', 2],
        ['E', '022100', 3],
        ['G', '320003', 4],
        ['D', 'xx0232', 5]
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO chords (song_id, chord_name, tab_data, position_order) VALUES (?, ?, ?, ?)");

    foreach ($chordHotelCalifornia as $chord) {
        $stmt->execute([$songId, $chord[0], $chord[1], $chord[2]]);
    }

    echo "Базата данни и таблиците са създадени успешно с примерни данни!";
} catch (PDOException $e) {
    die("Грешка при инсталация: " . $e->getMessage());
}
?>