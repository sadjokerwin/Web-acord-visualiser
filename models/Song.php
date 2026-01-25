<?php
require_once __DIR__ . '/Database.php';

class Song {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getAllSongs() {
        $stmt = $this->db->query("SELECT id, title, artist FROM songs ORDER BY title");
        return $stmt->fetchAll();
    }

    public function getSongById($id) {
        $stmt = $this->db->prepare("SELECT * FROM songs WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getSongChords($songId) {
        $stmt = $this->db->prepare(
            "SELECT chord_name, tab_data, position_order 
             FROM chords 
             WHERE song_id = ? 
             ORDER BY position_order"
        );
        $stmt->execute([$songId]);
        return $stmt->fetchAll();
    }
}
?>
