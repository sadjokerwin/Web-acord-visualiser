// Export Manager Module - PDF, JSON, CSV export functionality

// Export song to PDF
function exportToPDF(song, lyrics, chords) {
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
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    const cleanLine = line.replace(/<[^>]*>/g, "");
    const isChordLine =
      /^[A-G#mb/\s]+$/.test(cleanLine) && cleanLine.trim().length > 0 && cleanLine.length < 100;

    if (isChordLine) {
      doc.setTextColor(255, 153, 0);
      doc.setFont("courier", "bold");
    } else {
      doc.setTextColor(0, 0, 0);
      doc.setFont("courier", "normal");
    }

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

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 153, 0);
  doc.text("Chords:", margin, yPosition);
  yPosition += 10;

  doc.setDrawColor(255, 153, 0);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  chords.forEach((chord) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 153, 0);
    doc.text(chord.chord_name, margin, yPosition);
    yPosition += 8;

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
    soundcloud_url: song.soundcloud_url || "",
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
  const escapeCSV = (field) => {
    if (field === null || field === undefined) return "";
    const str = String(field);
    let escaped = str.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
    escaped = escaped.replace(/"/g, '""');
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return '"' + escaped + '"';
    }
    return escaped;
  };

  let csvContent = "Title,Artist,Lyrics,SoundCloudURL\n";
  csvContent += `${escapeCSV(song.title)},${escapeCSV(song.artist)},${escapeCSV(lyrics)},${escapeCSV(song.soundcloud_url || "")}\n`;

  csvContent += "\nChord Name,Tab Data,Position\n";
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
