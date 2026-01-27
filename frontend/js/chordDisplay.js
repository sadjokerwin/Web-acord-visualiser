// Chord Display Module - ASCII diagrams and visualization

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
