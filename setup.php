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

    // // Hymn for the Weekend - Coldplay
    // $soundcloudUrl1 = "https://w.soundcloud.com/player/?url=https://soundcloud.com/salvatore-mazzei-1/coldplay-hymn-for-the-weekend";
    // $stmt = $pdo->prepare("INSERT INTO songs (id, title, artist, soundcloud_url) VALUES (1, 'Hymn for the Weekend', 'Coldplay', ?) ON DUPLICATE KEY UPDATE soundcloud_url = ?");
    // $stmt->execute([$soundcloudUrl1, $soundcloudUrl1]);
    // $songId = 1;

    // $chordsHymnForTheWeekend = [
    //     ['Am', 'x02210', 0],
    //     ['F', 'xx3211', 1],
    //     ['C', 'x32010', 2],
    //     ['G', '320003', 3],
    //     ['Em', '022000', 4]
    // ];

    // $stmt = $pdo->prepare("INSERT IGNORE INTO chords (song_id, chord_name, tab_data, position_order) VALUES (?, ?, ?, ?)");
    // foreach ($chordsHymnForTheWeekend as $chord) {
    //     $stmt->execute([$songId, $chord[0], $chord[1], $chord[2]]);
    // }

    // // Adventure of a Lifetime - Coldplay
    // $soundcloudUrl2 = "https://w.soundcloud.com/player/?url=https://soundcloud.com/salvatore-mazzei-1/coldplay-adventure-of-a-life-time";
    // $stmt = $pdo->prepare("INSERT INTO songs (id, title, artist, soundcloud_url) VALUES (2, 'Adventure of a Lifetime', 'Coldplay', ?) ON DUPLICATE KEY UPDATE soundcloud_url = ?");
    // $stmt->execute([$soundcloudUrl2, $soundcloudUrl2]);
    // $songId = 2;

    // $chordsAdventureOfALifetime = [
    //     ['C', 'x32010', 0],
    //     ['F', 'xx3211', 1],
    //     ['Am', 'x02210', 2],
    //     ['G', '320003', 3],
    //     ['Dm', 'xx0231', 4]
    // ];

    // $stmt = $pdo->prepare("INSERT IGNORE INTO chords (song_id, chord_name, tab_data, position_order) VALUES (?, ?, ?, ?)");
    // foreach ($chordsAdventureOfALifetime as $chord) {
    //     $stmt->execute([$songId, $chord[0], $chord[1], $chord[2]]);
    // }

    $songsData = [
        [
            'id' => 1,
            'title' => 'Hymn for the Weekend',
            'artist' => 'Coldplay',
            'url' => 'https://soundcloud.com/salvatore-mazzei-1/coldplay-hymn-for-the-weekend',
            'chords' => [
                ['Am', 'x02210', 0],
                ['F', 'xx3211', 1],
                ['C', 'x32010', 2],
                ['G', '320003', 3],
                ['Em', '022000', 4]
            ]
        ],
        [
            'id' => 2,
            'title' => 'Adventure of a Lifetime',
            'artist' => 'Coldplay',
            'url' => 'https://soundcloud.com/salvatore-mazzei-1/coldplay-adventure-of-a-life-time',
            'chords' => [
                ['C', 'x32010', 0],
                ['F', 'xx3211', 1],
                ['Am', 'x02210', 2],
                ['G', '320003', 3],
                ['Dm', 'xx0231', 4]
            ]
        ],
        [
            'id' => 3,
            'title' => 'Wonderwall',
            'artist' => 'Oasis',
            'url' => 'https://soundcloud.com/oasisofficial/wonderwall-live-from-dublin-16',
            'chords' => [
                ['Em7', '022033', 0],
                ['G', '320033', 1],
                ['D7sus4', 'xx0213', 2],
                ['A7sus4', 'x02033', 3],
                ['Cadd9', 'x32033', 4]
            ]
        ],
        [
            'id' => 4,
            'title' => 'Shape of You',
            'artist' => 'Ed Sheeran',
            'url' => 'https://soundcloud.com/edsheeran/shape-of-you',
            'chords' => [
                ['Bm', 'x24432', 0],
                ['Em', '022000', 1],
                ['G', '320003', 2],
                ['A', 'x02220', 3]
            ]
        ],
        [
            'id' => 5,
            'title' => 'Let It Be',
            'artist' => 'The Beatles',
            'url' => 'https://soundcloud.com/the-love-beatles/let-it-be',
            'chords' => [
                ['C', 'x32010', 0],
                ['G', '320003', 1],
                ['Am', 'x02210', 2],
                ['F', '133211', 3]
            ]
        ],
        [
            'id' => 6,
            'title' => 'Riptide',
            'artist' => 'Vance Joy',
            'url' => 'https://soundcloud.com/wearebigbeat/vance-joy-riptide',
            'chords' => [
                ['Am', 'x02210', 0],
                ['G', '320003', 1],
                ['C', 'x32010', 2],
                ['Fmaj7', 'xx3210', 3]
            ]
        ],
        [
            'id' => 7,
            'title' => 'Knockin on Heavens Door',
            'artist' => 'Bob Dylan',
            'url' => 'https://soundcloud.com/michael-desmet-175889309/knocking-on-heavens-door-bob',
            'chords' => [
                ['G', '320003', 0],
                ['D', 'xx0232', 1],
                ['Am', 'x02210', 2],
                ['C', 'x32010', 3]
            ]
        ],
        [
            'id' => 8,
            'title' => 'Zombie',
            'artist' => 'The Cranberries',
            'url' => 'https://soundcloud.com/camayn/zombie-the-cranberries',
            'chords' => [
                ['Em', '022000', 0],
                ['C', 'x32010', 1],
                ['G', '320003', 2],
                ['D/F#', '2x0232', 3]
            ]
        ],
        [
            'id' => 9,
            'title' => 'Californication',
            'artist' => 'Red Hot Chili Peppers',
            'url' => 'https://soundcloud.com/the-uk-chili-peppers/californication',
            'chords' => [
                ['Am', 'x02210', 0],
                ['F', '133211', 1],
                ['C', 'x32010', 2],
                ['G', '320003', 3],
                ['Dm', 'xx0231', 4]
            ]
        ],
        [
            'id' => 10,
            'title' => 'Counting Stars',
            'artist' => 'OneRepublic',
            'url' => 'https://soundcloud.com/alex_legrand/counting-stars-onerepublic-2',
            'chords' => [
                ['Am', 'x02210', 0],
                ['C', 'x32010', 1],
                ['G', '320003', 2],
                ['F', '133211', 3]
            ]
        ]
    ];

    // Изпълнение на заявките
    foreach ($songsData as $song) {
        // 1. Запис/Обновяване на песента
        $stmt = $pdo->prepare("INSERT INTO songs (id, title, artist, soundcloud_url) 
                           VALUES (?, ?, ?, ?) 
                           ON DUPLICATE KEY UPDATE title = VALUES(title), artist = VALUES(artist), soundcloud_url = VALUES(soundcloud_url)");
        $stmt->execute([$song['id'], $song['title'], $song['artist'], $song['url']]);

        // 2. Изтриваме старите акорди за тази песен (за да няма дублиране при повторен setup)
        $pdo->prepare("DELETE FROM chords WHERE song_id = ?")->execute([$song['id']]);

        // 3. Запис на новите акорди
        $stmtChord = $pdo->prepare("INSERT INTO chords (song_id, chord_name, tab_data, position_order) VALUES (?, ?, ?, ?)");
        foreach ($song['chords'] as $chord) {
            $stmtChord->execute([$song['id'], $chord[0], $chord[1], $chord[2]]);
        }
    }

    echo "Базата данни и таблиците са създадени успешно с примерни данни!";
} catch (PDOException $e) {
    die("Грешка при инсталация: " . $e->getMessage());
}
?>