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

  chords.forEach((chord, index) => {
    const playBtn = document.getElementById(`play-chord-${index}`);
    if (playBtn) {
      playBtn.addEventListener("click", () => playChord(chord.tab_data, chord.chord_name));
    }
  });
}

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

function generateChordDiagram(chordName, tabData) {
  const frets = tabData.split("");
  const strings = ["e", "h", "g", "d", "A", "E"];
  const numericFrets = frets
    .map((f) => (f === "x" ? null : parseInt(f)))
    .filter((f) => f !== null && f > 0);

  const minFret = numericFrets.length > 0 ? Math.min(...numericFrets) : 1;
  const maxFret = numericFrets.length > 0 ? Math.max(...numericFrets) : 3;

  const startFret = minFret;
  const numFretsToShow = Math.max(3, maxFret - startFret + 1);

  let diagram = "";
  diagram += `  ${chordName}\n`;

  for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
    const stringName = strings[stringIdx];
    const fretValue = frets[5 - stringIdx];

    diagram += `${stringName} `;

    if (fretValue === "x") {
      diagram += "X||";
      for (let f = 0; f < numFretsToShow; f++) {
        diagram += "---|";
      }
    } else if (fretValue === "0") {
      diagram += "O||";
      for (let f = 0; f < numFretsToShow; f++) {
        diagram += "---|";
      }
    } else {
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
