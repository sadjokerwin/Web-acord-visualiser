<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <title>Chord Finder</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f4f4f4; }
        .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; }
        #tab-display { 
            background: #222; color: #0f0; padding: 20px; 
            font-family: monospace; white-space: pre; overflow-x: auto; 
            border-radius: 5px; margin-top: 20px; display: none;
        }
        input { padding: 10px; width: 70%; }
        button { padding: 10px 20px; cursor: pointer; }
    </style>
</head>
<body>

<div class="container">
    <h2>Търсене на акорди</h2>
    <input type="text" id="searchQuery" placeholder="Въведете име на песен...">
    <button onclick="searchSong()">Търси</button>

    <div id="song-info"></div>
    <div id="tab-display"></div>
</div>

<script>
function searchSong() {
    const query = document.getElementById('searchQuery').value;
    const display = document.getElementById('tab-display');
    const info = document.getElementById('song-info');

    fetch(`search.php?query=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                info.innerHTML = "Песента не е намерена.";
                display.style.display = 'none';
                return;
            }

            info.innerHTML = `<h3>${data[0].title} - ${data[0].artist}</h3>`;
            display.innerHTML = generateASCII(data);
            display.style.display = 'block';
        });
}

function generateASCII(chords) {
    let strings = ["e|", "B|", "G|", "D|", "A|", "E|"];
    let names = "   ";

    chords.forEach(c => {
        names += c.chord_name.padEnd(7, " ");
        for (let i = 0; i < 6; i++) {
            let fret = c.tab_data[i] || '-';
            strings[i] += `---${fret}---`;
        }
    });

    return names + "\n" + strings.join("|\n") + "|";
}
</script>

</body>
</html>