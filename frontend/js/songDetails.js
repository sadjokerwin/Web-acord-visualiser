// Song Details Module - loading and displaying song details

// Load song details
async function loadSongDetails(songId) {
  showSongPage();

  const url = new URL(window.location);
  url.searchParams.set("song", songId);
  window.history.pushState({}, "", url);

  const songInfo = document.getElementById("songInfo");
  songInfo.innerHTML = '<div class="loading">Зареждане...</div>';

  try {
    const detailsResponse = await fetch(`${API_BASE_URL}/get_song_details.php?id=${songId}`);
    const data = await detailsResponse.json();

    let lyrics = data.song.lyrics;

    if (!lyrics || lyrics.trim() === "") {
      const artist = encodeURIComponent(data.song.artist);
      const title = encodeURIComponent(data.song.title);

      try {
        const lyricsResponse = await fetch(`${LYRICS_API_URL}/${artist}/${title}`);
        const lyricsData = await lyricsResponse.json();
        lyrics = lyricsData.lyrics;

        const formattedLyrics = formatLyricsWithChords(lyrics, data.chords);
        saveLyrics(songId, formattedLyrics);
        lyrics = formattedLyrics;
      } catch (error) {
        console.error("Грешка при зареждане на текста:", error);
        lyrics = "Текстът на песента не е наличен";
      }
    }

    displaySongInfo(data.song, lyrics, data.chords);
    displaySoundCloudPlayer(data.song.soundcloud_url);
    displayChords(data.chords);

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
  const cleanedLyrics = sanitizeLyrics(lyrics);

  try {
    await fetch(`${API_BASE_URL}/save_lyrics.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        song_id: songId,
        lyrics: cleanedLyrics,
      }),
    });
  } catch (error) {
    console.error("Грешка при запазване на текста:", error);
  }
}

// Display SoundCloud player
function displaySoundCloudPlayer(soundcloudUrl) {
  const playerContainer = document.getElementById("soundcloudPlayer");

  if (!soundcloudUrl || soundcloudUrl.trim() === "") {
    playerContainer.style.display = "none";
    return;
  }

  let embedUrl = soundcloudUrl;
  if (!soundcloudUrl.includes("w.soundcloud.com/player")) {
    const cleanUrl = soundcloudUrl.split("?")[0];
    embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(cleanUrl)}`;
  }

  playerContainer.innerHTML = `
    <iframe
      width="100%"
      height="166"
      scrolling="no"
      frameborder="no"
      allow="autoplay"
      src="${embedUrl}">
    </iframe>
  `;
  playerContainer.style.display = "block";
}

// Display song information and lyrics
function displaySongInfo(song, lyrics, chords) {
  const songInfo = document.getElementById("songInfo");

  const lyricsWithChords = addChordsToLyrics(lyrics, chords);

  songInfo.innerHTML = `
        <div class="song-header">
            <h2>${song.title}</h2>
            <p class="artist">${song.artist}</p>
        </div>
        <div class="lyrics">${lyricsWithChords || "Текстът на песента не е наличен"}</div>
    `;

  attachChordClickListeners(chords);
}
