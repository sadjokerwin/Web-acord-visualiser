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
        lyrics TEXT,
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

    // Hymn for the Weekend - Coldplay
    $stmt = $pdo->prepare("INSERT IGNORE INTO songs (id, title, artist) VALUES (1, 'Hymn for the Weekend', 'Coldplay')");
    $stmt->execute();
    $songId = 1;

    $chordsHymnForTheWeekend = [
        ['Am', 'x02210', 0],
        ['F', 'xx3211', 1],
        ['C', 'x32010', 2],
        ['G', '320003', 3],
        ['Em', '022000', 4]
    ];

    $stmt = $pdo->prepare("INSERT IGNORE INTO chords (song_id, chord_name, tab_data, position_order) VALUES (?, ?, ?, ?)");
    foreach ($chordsHymnForTheWeekend as $chord) {
        $stmt->execute([$songId, $chord[0], $chord[1], $chord[2]]);
    }

    // Adventure of a Lifetime - Coldplay
    $stmt = $pdo->prepare("INSERT IGNORE INTO songs (id, title, artist) VALUES (2, 'Adventure of a Lifetime', 'Coldplay')");
    $stmt->execute();
    $songId = 2;

    $chordsAdventureOfALifetime = [
        ['C', 'x32010', 0],
        ['F', 'xx3211', 1],
        ['Am', 'x02210', 2],
        ['G', '320003', 3],
        ['Dm', 'xx0231', 4]
    ];

    $stmt = $pdo->prepare("INSERT IGNORE INTO chords (song_id, chord_name, tab_data, position_order) VALUES (?, ?, ?, ?)");
    foreach ($chordsAdventureOfALifetime as $chord) {
        $stmt->execute([$songId, $chord[0], $chord[1], $chord[2]]);
    }

    echo "Базата данни и таблиците са създадени успешно с примерни данни!";
} catch (PDOException $e) {
    die("Грешка при инсталация: " . $e->getMessage());
}
?>