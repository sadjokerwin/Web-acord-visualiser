// Lyrics Formatter Module - lyrics parsing and chord positioning

// Format plain lyrics with chord positioning
function formatLyricsWithChords(plainLyrics, chords) {
  if (!plainLyrics || !chords || chords.length === 0) {
    return sanitizeLyrics(plainLyrics);
  }

  let lyrics = sanitizeLyrics(plainLyrics);
  let lines = lyrics.split("\n");
  let formattedLines = [];
  const chordNames = [...new Set(chords.map((c) => c.chord_name))];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("[") && trimmedLine.endsWith("]")) {
      formattedLines.push(line);
      continue;
    }

    if (trimmedLine === "") {
      formattedLines.push("");
      continue;
    }

    const shouldAddChords =
      trimmedLine.length > 10 &&
      !trimmedLine.match(/^[\s\-,\.!?]+$/) &&
      (i === 0 || lines[i - 1].trim() === "" || lines[i - 1].trim().startsWith("["));

    if (shouldAddChords && chordNames.length > 0) {
      const chordIndex =
        Math.floor(formattedLines.filter((l) => l.match(/^[A-G]/)).length) % chordNames.length;
      const numChords = Math.min(2 + Math.floor(Math.random() * 2), chordNames.length);

      let chordLine = "";
      for (let j = 0; j < numChords; j++) {
        const idx = (chordIndex + j) % chordNames.length;
        if (j > 0) chordLine += "  ";
        chordLine += chordNames[idx];
      }

      formattedLines.push(chordLine);
    }

    formattedLines.push(line);
  }

  return formattedLines.join("\n");
}

// Sanitize lyrics text from API
function sanitizeLyrics(lyrics) {
  if (!lyrics) return "";

  let cleaned = lyrics
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.trim();

  return cleaned;
}

// Add chords above lyrics (enhanced implementation)
function addChordsToLyrics(lyrics, chords) {
  if (!lyrics) return "";

  const chordMap = {};
  if (chords && chords.length > 0) {
    chords.forEach((chord) => {
      chordMap[chord.chord_name] = chord.tab_data;
    });
  }

  const chordNames = Object.keys(chordMap);
  const escapedChords = chordNames.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const chordPattern =
    chordNames.length > 0 ? new RegExp(`\\b(${escapedChords.join("|")})\\b`, "g") : null;

  const lines = lyrics.split("\n");
  let result = "";
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine === "" && i === 0) {
      i++;
      continue;
    }

    if (/^\[.*\]$/.test(trimmedLine)) {
      const sectionName = trimmedLine.replace(/[\[\]]/g, "");
      result += `<div class="section-title">${sectionName}</div>`;
      i++;
      continue;
    }

    const isChordLine =
      /^[A-G][#b]?[m]?[0-9]?(\s+[A-G][#b]?[m]?[0-9]?)*\s*$/.test(trimmedLine) &&
      trimmedLine.length > 0 &&
      trimmedLine.length < 150;

    if (isChordLine && chordPattern) {
      const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
      const nextTrimmed = nextLine.trim();
      const isNextLineEmpty = nextTrimmed === "";
      const isNextLineSection = /^\[.*\]$/.test(nextTrimmed);
      const isNextLineChords =
        /^[A-G][#b]?[m]?[0-9]?(\s+[A-G][#b]?[m]?[0-9]?)*\s*$/.test(nextTrimmed) &&
        nextTrimmed.length > 0;

      let processedChords = "";
      let lastIndex = 0;
      const matches = [...line.matchAll(chordPattern)];

      matches.forEach((match) => {
        processedChords += line.substring(lastIndex, match.index);
        processedChords += `<span class="chord-inline" data-chord="${match[0]}" data-tab="${chordMap[match[0]] || ""}">${match[0]}</span>`;
        lastIndex = match.index + match[0].length;
      });
      processedChords += line.substring(lastIndex);

      if (!isNextLineEmpty && !isNextLineChords && !isNextLineSection && nextLine) {
        result += `<div class="chord-line">${processedChords || "&nbsp;"}</div>`;
        result += `<div class="lyric-line">${nextLine}</div>`;
        i += 2;
      } else {
        result += `<div class="chord-line">${processedChords || "&nbsp;"}</div>`;
        i++;
      }
    } else if (trimmedLine === "") {
      if (i > 0 && lines[i - 1].trim() !== "") {
        result += "<br>";
      }
      i++;
    } else if (trimmedLine.startsWith("(") && trimmedLine.endsWith(")")) {
      result += `<div class="performance-note">${trimmedLine}</div>`;
      i++;
    } else {
      if (chordPattern && chordPattern.test(line)) {
        const processedLine = line.replace(chordPattern, (match) => {
          return `<span class="chord-inline" data-chord="${match}" data-tab="${chordMap[match] || ""}">${match}</span>`;
        });
        result += `<div class="lyric-line">${processedLine}</div>`;
      } else {
        result += `<div class="lyric-line">${line || "&nbsp;"}</div>`;
      }
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
