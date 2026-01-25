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
        soundcloud_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Add soundcloud_url column if it doesn't exist (for existing databases)
    try {
        $pdo->exec("ALTER TABLE songs ADD COLUMN soundcloud_url TEXT");
    } catch (PDOException $e) {
        // Column already exists, ignore
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS chords (
        id INT AUTO_INCREMENT PRIMARY KEY,
        song_id INT,
        chord_name VARCHAR(50),
        tab_data TEXT,
        position_order INT,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    )");

    // Hymn for the Weekend - Coldplay
    $soundcloudUrl1 = "https://w.soundcloud.com/player/?url=https://soundcloud.com/salvatore-mazzei-1/coldplay-hymn-for-the-weekend";
    $stmt = $pdo->prepare("INSERT INTO songs (id, title, artist, soundcloud_url) VALUES (1, 'Hymn for the Weekend', 'Coldplay', ?) ON DUPLICATE KEY UPDATE soundcloud_url = ?");
    $stmt->execute([$soundcloudUrl1, $soundcloudUrl1]);
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
    $soundcloudUrl2 = "https://w.soundcloud.com/player/?url=https://soundcloud.com/salvatore-mazzei-1/coldplay-adventure-of-a-life-time";
    $stmt = $pdo->prepare("INSERT INTO songs (id, title, artist, soundcloud_url) VALUES (2, 'Adventure of a Lifetime', 'Coldplay', ?) ON DUPLICATE KEY UPDATE soundcloud_url = ?");
    $stmt->execute([$soundcloudUrl2, $soundcloudUrl2]);
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