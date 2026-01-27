// Import Manager Module - JSON and CSV import functionality

function setupImportButton() {
  const importBtn = document.getElementById("importButton");
  const fileInput = document.getElementById("importFileInput");

  importBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const extension = file.name.split(".").pop().toLowerCase();

    reader.onload = async (event) => {
      const content = event.target.result;
      let songData = null;

      try {
        if (extension === "json") {
          songData = JSON.parse(content);
        } else if (extension === "csv") {
          songData = parseCSVToJSON(content);
        }

        if (songData) {
          await sendImportedSongToDB(songData);
        }
      } catch (err) {
        alert("Грешка при четене на файла: " + err.message);
      }
    };

    if (extension === "json" || extension === "csv") {
      reader.readAsText(file);
    }
  });
}

// Helper function to parse CSV lines with proper quote handling
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Parse CSV to JSON object
function parseCSVToJSON(csvText) {
  const lines = csvText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const songHeaderIndex = lines.findIndex((line) => line.startsWith("Title"));
  if (songHeaderIndex === -1) throw new Error("Invalid CSV format: no Title header found");

  const songDataLine = lines[songHeaderIndex + 1];
  if (!songDataLine) throw new Error("Invalid CSV format: no song data found");

  const songFields = parseCSVLine(songDataLine);

  let lyrics = songFields[2] || "";
  lyrics = lyrics.replace(/\\n/g, "\n").replace(/\\r/g, "\r");

  const song = {
    title: songFields[0] || "",
    artist: songFields[1] || "",
    lyrics: lyrics,
    soundcloud_url: songFields[3] || "",
    chords: [],
  };

  const chordHeaderIndex = lines.findIndex((line) => line.includes("Chord Name"));
  if (chordHeaderIndex === -1) {
    return song;
  }

  for (let i = chordHeaderIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0) continue;

    const chordFields = parseCSVLine(line);
    if (chordFields.length >= 3 && chordFields[0].trim()) {
      song.chords.push({
        name: chordFields[0].trim(),
        tab: chordFields[1].trim(),
        position: parseInt(chordFields[2].trim()) || 0,
      });
    }
  }

  return song;
}

// Send imported song to database
async function sendImportedSongToDB(songData) {
  try {
    const response = await fetch(`${API_BASE_URL}/save_imported_song.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(songData),
    });

    const result = await response.json();
    if (result.success) {
      alert("Песента '" + songData.title + "' е импортирана успешно!");
      loadSongs();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Грешка при импорт:", error);
    alert("Грешка при запис в базата: " + error.message);
  }
}
