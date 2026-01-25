// API Configuration
const API_BASE_URL = "../backend";
const LYRICS_API_URL = "https://api.lyrics.ovh/v1";

// Store current song data for PDF export
let currentSongData = null;

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  // Check if there's a song ID in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const songId = urlParams.get("song");

  if (songId) {
    // Load specific song if ID is in URL
    loadSongDetails(parseInt(songId));
  } else {
    // Show home page
    showHomePage();
  }

  loadSongs();
  setupBackButton();
  setupExportButton();
  setupExportJsonButton();
  setupExportCsvButton();
});

// Load all songs from database
async function loadSongs() {
  try {
    const response = await fetch(`${API_BASE_URL}/get_songs.php`);
    const songs = await response.json();

    const songsGrid = document.getElementById("songsGrid");
    songsGrid.innerHTML = "";

    songs.forEach((song) => {
      const songCard = createSongCard(song);
      songsGrid.appendChild(songCard);
    });
  } catch (error) {
    console.error("Грешка при зареждане на песни:", error);
  }
}

// Create song card element
function createSongCard(song) {
  const div = document.createElement("div");
  div.className = "song-card";

  div.innerHTML = `
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
    `;

  div.addEventListener("click", () => loadSongDetails(song.id));

  return div;
}

// Setup back button
function setupBackButton() {
  const backButton = document.getElementById("backButton");
  backButton.addEventListener("click", () => {
    showHomePage();
  });
}

// Setup export button
function setupExportButton() {
  const exportButton = document.getElementById("exportPdfButton");
  exportButton.addEventListener("click", () => {
    if (currentSongData) {
      exportToPDF(currentSongData.song, currentSongData.lyrics, currentSongData.chords);
    } else {
      alert("Няма заредена песен за експорт!");
    }
  });
}

// Setup JSON export button
function setupExportJsonButton() {
  const exportButton = document.getElementById("exportJsonButton");
  exportButton.addEventListener("click", () => {
    if (currentSongData) {
      exportToJSON(currentSongData.song, currentSongData.lyrics, currentSongData.chords);
    } else {
      alert("Няма заредена песен за експорт!");
    }
  });
}

// Setup CSV export button
function setupExportCsvButton() {
  const exportButton = document.getElementById("exportCsvButton");
  exportButton.addEventListener("click", () => {
    if (currentSongData) {
      exportToCSV(currentSongData.song, currentSongData.lyrics, currentSongData.chords);
    } else {
      alert("Няма заредена песен за експорт!");
    }
  });
}

// Show home page
function showHomePage() {
  document.getElementById("homePage").style.display = "block";
  document.getElementById("songPage").style.display = "none";

  // Remove song ID from URL
  const url = new URL(window.location);
  url.searchParams.delete("song");
  window.history.pushState({}, "", url);
}

// Show song page
function showSongPage() {
  document.getElementById("homePage").style.display = "none";
  document.getElementById("songPage").style.display = "block";
  window.scrollTo(0, 0);
}

// Load song details
async function loadSongDetails(songId) {
  showSongPage();

  // Update URL with song ID
  const url = new URL(window.location);
  url.searchParams.set("song", songId);
  window.history.pushState({}, "", url);

  const songInfo = document.getElementById("songInfo");
  songInfo.innerHTML = '<div class="loading">Зареждане...</div>';

  try {
    // Load song details from database
    const detailsResponse = await fetch(`${API_BASE_URL}/get_song_details.php?id=${songId}`);
    const data = await detailsResponse.json();

    let lyrics = data.song.lyrics;

    // If lyrics not in database, fetch from API
    if (!lyrics || lyrics.trim() === "") {
      const artist = encodeURIComponent(data.song.artist);
      const title = encodeURIComponent(data.song.title);

      try {
        const lyricsResponse = await fetch(`${LYRICS_API_URL}/${artist}/${title}`);
        const lyricsData = await lyricsResponse.json();
        lyrics = lyricsData.lyrics;

        // Save lyrics to database for next time
        saveLyrics(songId, lyrics);
      } catch (error) {
        console.error("Грешка при зареждане на текста:", error);
        lyrics = "Текстът на песента не е наличен";
      }
    }

    // Display song info and lyrics
    displaySongInfo(data.song, lyrics, data.chords);

    // Display chords
    displayChords(data.chords);

    // Store current song data for PDF export
    currentSongData = {
      song: data.song,
      lyrics: lyrics,
      chords: data.chords,
    };
  } catch (error) {
    console.error("Грешка при зареждане на песен:", error);
    songInfo.innerHTML = '<div class="loading">Грешка при зареждане на песента</div>';
  }
}

// Save lyrics to database
async function saveLyrics(songId, lyrics) {
  try {
    await fetch(`${API_BASE_URL}/save_lyrics.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        song_id: songId,
        lyrics: lyrics,
      }),
    });
  } catch (error) {
    console.error("Грешка при запазване на текста:", error);
  }
}

// Display song information and lyrics
function displaySongInfo(song, lyrics, chords) {
  const songInfo = document.getElementById("songInfo");

  // Add chords inline with lyrics with click functionality
  const lyricsWithChords = addChordsToLyrics(lyrics, chords);

  songInfo.innerHTML = `
        <div class="song-header">
            <h2>${song.title}</h2>
            <p class="artist">${song.artist}</p>
        </div>
        <div class="lyrics">${lyricsWithChords || "Текстът на песента не е наличен"}</div>
    `;

  // Add click event listeners to chord spans
  attachChordClickListeners(chords);
}

// Add chords above lyrics (enhanced implementation)
function addChordsToLyrics(lyrics, chords) {
  if (!lyrics) return "";

  // Create a map of chord names to their tab data
  const chordMap = {};
  if (chords && chords.length > 0) {
    chords.forEach((chord) => {
      chordMap[chord.chord_name] = chord.tab_data;
    });
  }

  // Build regex pattern from available chords
  const chordNames = Object.keys(chordMap);
  const escapedChords = chordNames.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const chordPattern =
    chordNames.length > 0 ? new RegExp(`\\b(${escapedChords.join("|")})\\b`, "g") : null;

  // Split lyrics into lines
  const lines = lyrics.split("\n");
  let result = "";
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];

    // Check for section headers like [Intro], [Verse 1], etc.
    if (/^\[.*\]$/.test(line.trim())) {
      const sectionName = line.trim().replace(/[\[\]]/g, "");
      result += `<div class="section-title">${sectionName}:</div>`;
      i++;
      continue;
    }

    // Check if line contains only chords (and spaces)
    const isChordLine =
      /^[A-G#mb/\s\d]+$/.test(line) && line.trim().length > 0 && line.length < 100;

    if (isChordLine && chordPattern) {
      // This is a chord line
      const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
      const isNextLineEmpty = nextLine.trim() === "";
      const isNextLineChords = /^[A-G#mb/\s\d]+$/.test(nextLine) && nextLine.trim().length > 0;

      // Replace chord names with clickable spans
      const processedChords = line.replace(chordPattern, (match) => {
        return `<span class="chord-inline" data-chord="${match}" data-tab="${chordMap[match] || ""}">${match}</span>`;
      });

      if (!isNextLineEmpty && !isNextLineChords && nextLine) {
        // Next line is lyrics - show chord above it
        result += `<div class="chord-line">${processedChords}</div>`;
        result += `<div class="lyric-line">${nextLine}</div>`;
        i += 2; // Skip both lines
      } else {
        // Standalone chord line
        result += `<div class="chord-line">${processedChords}</div>`;
        i++;
      }
    } else if (line.trim() === "") {
      // Empty line - add spacing
      result += "<br>";
      i++;
    } else {
      // Regular text line
      result += `<div class="lyric-line">${line}</div>`;
      i++;
    }
  }

  return result;
}

// Attach click listeners to chord spans
function attachChordClickListeners(chords) {
  const chordSpans = document.querySelectorAll(".chord-inline");

  chordSpans.forEach((span) => {
    span.addEventListener("click", () => {
      const chordName = span.getAttribute("data-chord");
      const tabData = span.getAttribute("data-tab");

      if (tabData) {
        playChord(tabData, chordName);
      }
    });
  });
}

// Display chords with ASCII diagrams
function displayChords(chords) {
  const chordsSection = document.getElementById("chordsSection");

  if (chords.length === 0) {
    chordsSection.innerHTML = "";
    return;
  }

  const chordsHTML = `
        <h3 class="chords-title">Използвани акорди:</h3>
        <div class="chords-grid">
            ${chords.map((chord) => createChordBox(chord)).join("")}
        </div>
    `;

  chordsSection.innerHTML = chordsHTML;

  // Add event listeners for play buttons
  chords.forEach((chord, index) => {
    const playBtn = document.getElementById(`play-chord-${index}`);
    if (playBtn) {
      playBtn.addEventListener("click", () => playChord(chord.tab_data, chord.chord_name));
    }
  });
}

// Create chord box with ASCII diagram
function createChordBox(chord, index) {
  const diagram = generateChordDiagram(chord.chord_name, chord.tab_data);

  return `
        <div class="chord-box">
            <div class="chord-name">${chord.chord_name}</div>
            <div class="chord-diagram">${diagram}</div>
            <button class="play-chord-btn" id="play-chord-${chord.position_order}">
                ▶ Слушай акорд
            </button>
        </div>
    `;
}

// Generate ASCII chord diagram from tab data
function generateChordDiagram(chordName, tabData) {
  // Parse tab data (e.g., "x32010" means E=x, A=3, D=2, G=0, B=1, e=0)
  const frets = tabData.split("");

  // String names from high to low (e is thinnest, E is thickest)
  const strings = ["e", "h", "g", "d", "A", "E"];

  // Determine which frets to display (find min and max non-zero frets)
  const numericFrets = frets
    .map((f) => (f === "x" ? null : parseInt(f)))
    .filter((f) => f !== null && f > 0);

  const minFret = numericFrets.length > 0 ? Math.min(...numericFrets) : 1;
  const maxFret = numericFrets.length > 0 ? Math.max(...numericFrets) : 3;

  // Decide how many frets to show (at least 3)
  const startFret = minFret;
  const numFretsToShow = Math.max(3, maxFret - startFret + 1);

  let diagram = "";

  // Add chord name at top
  diagram += `  ${chordName}\n`;

  // For each string (6 strings, from high e to low E)
  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const stringName = strings[stringIdx];
    const fretValue = frets[5 - stringIdx]; // Reverse: e(0), B(1), G(2), D(3), A(4), E(5)

    diagram += `${stringName} `;

    if (fretValue === "x") {
      // Muted string
      diagram += "X||";
      for (let f = 0; f < numFretsToShow; f++) {
        diagram += "---|";
      }
    } else if (fretValue === "0") {
      // Open string
      diagram += "O||";
      for (let f = 0; f < numFretsToShow; f++) {
        diagram += "---|";
      }
    } else {
      // Finger on fret
      const fretNum = parseInt(fretValue);
      diagram += "-||";

      for (let f = startFret; f < startFret + numFretsToShow; f++) {
        if (f === fretNum) {
          diagram += "-O-|";
        } else {
          diagram += "---|";
        }
      }
    }

    diagram += "\n";
  }

  return diagram;
}

// Play chord sound using Web Audio API
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

async function playChord(tabData, chordName) {
  const ctx = getAudioContext();

  // Wake up audio context if suspended
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  try {
    // Get frequencies for each string
    const frequencies = getFrequenciesFromTabData(tabData);
    const now = ctx.currentTime;

    // Play each string with strumming effect
    frequencies.forEach((freq, index) => {
      if (freq) {
        // Create oscillator (sound generator)
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "triangle"; // Soft sound, similar to guitar
        osc.frequency.value = freq;

        // Connect audio nodes
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Strumming effect: delay each subsequent string by 50ms
        const strumDelay = index * 0.05;

        // Volume envelope (Attack, Decay, Sustain, Release)
        gainNode.gain.setValueAtTime(0, now + strumDelay);
        gainNode.gain.linearRampToValueAtTime(0.3, now + strumDelay + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + strumDelay + 1.5); // Release

        osc.start(now + strumDelay);
        osc.stop(now + strumDelay + 2); // Stop after 2 seconds
      }
    });

    console.log(`Playing chord ${chordName}`);
  } catch (error) {
    console.error("Грешка при свирене на акорд:", error);
  }
}

// Convert tab data to frequencies
function getFrequenciesFromTabData(tabData) {
  const frets = tabData.split("");

  // Guitar strings: E A D G B e (from thickest to thinnest)
  // Standard tuning frequencies for open strings
  const openStringFrequencies = [
    82.41, // E2 (thickest string)
    110.0, // A2
    146.83, // D3
    196.0, // G3
    246.94, // B3
    329.63, // E4 (thinnest string)
  ];

  const frequencies = [];

  // Process each string
  for (let i = 0; i < 6; i++) {
    const fretValue = frets[i];

    if (fretValue === "x") {
      // Muted string - skip
      frequencies.push(null);
      continue;
    }

    const fretNum = parseInt(fretValue);
    const openFreq = openStringFrequencies[i];

    // Calculate frequency: each fret is a semitone (multiply by 2^(1/12))
    const frequency = openFreq * Math.pow(2, fretNum / 12);
    frequencies.push(frequency);
  }

  return frequencies;
}

// Export song to PDF
function exportToPDF(song, lyrics, chords) {
  // Check if jsPDF is loaded
  if (typeof window.jspdf === "undefined") {
    alert("PDF библиотеката не е заредена!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(song.title, margin, yPosition);
  yPosition += 10;

  // Artist
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Artist: ${song.artist}`, margin, yPosition);
  yPosition += 15;

  // Separator line
  doc.setDrawColor(255, 153, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Lyrics
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("courier", "normal");

  const lines = lyrics.split("\n");

  for (let line of lines) {
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    // Clean HTML tags from chord spans if any
    const cleanLine = line.replace(/<[^>]*>/g, "");

    // Check if line contains chords
    const isChordLine =
      /^[A-G#mb/\s]+$/.test(cleanLine) && cleanLine.trim().length > 0 && cleanLine.length < 100;

    if (isChordLine) {
      doc.setTextColor(255, 153, 0);
      doc.setFont("courier", "bold");
    } else {
      doc.setTextColor(0, 0, 0);
      doc.setFont("courier", "normal");
    }

    // Split long lines
    const splitLines = doc.splitTextToSize(cleanLine, maxWidth);
    splitLines.forEach((splitLine) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(splitLine, margin, yPosition);
      yPosition += 5;
    });
  }

  // New page for chords
  doc.addPage();
  yPosition = 20;

  // Chords section title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 153, 0);
  doc.text("Chords:", margin, yPosition);
  yPosition += 10;

  doc.setDrawColor(255, 153, 0);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Display chords
  chords.forEach((chord, index) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    // Chord name
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 153, 0);
    doc.text(chord.chord_name, margin, yPosition);
    yPosition += 8;

    // Chord diagram
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.setTextColor(0, 0, 0);

    const diagram = generateChordDiagram(chord.chord_name, chord.tab_data);
    const diagramLines = diagram.split("\n");

    diagramLines.forEach((line) => {
      doc.text(line, margin + 5, yPosition);
      yPosition += 3;
    });

    yPosition += 10;
  });

  // Save the PDF
  const filename = `${song.title} - ${song.artist}.pdf`;
  doc.save(filename);

  console.log(`PDF exported: ${filename}`);
}

// Export song to JSON
function exportToJSON(song, lyrics, chords) {
  const data = {
    title: song.title,
    artist: song.artist,
    lyrics: lyrics,
    chords: chords.map((chord) => ({
      name: chord.chord_name,
      tab: chord.tab_data,
      position: chord.position_order,
    })),
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${song.title} - ${song.artist}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`JSON exported: ${song.title} - ${song.artist}.json`);
}

// Export song to CSV
function exportToCSV(song, lyrics, chords) {
  // Escape CSV field (handle quotes and commas)
  const escapeCSV = (field) => {
    if (field === null || field === undefined) return "";
    const str = String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // Create CSV content
  let csvContent = "Title,Artist,Lyrics\n";
  csvContent += `${escapeCSV(song.title)},${escapeCSV(song.artist)},${escapeCSV(lyrics)}\n\n`;

  // Add chords section
  csvContent += "Chord Name,Tab Data,Position\n";
  chords.forEach((chord) => {
    csvContent += `${escapeCSV(chord.chord_name)},${escapeCSV(chord.tab_data)},${escapeCSV(chord.position_order)}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${song.title} - ${song.artist}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`CSV exported: ${song.title} - ${song.artist}.csv`);
}
