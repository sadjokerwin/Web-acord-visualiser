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

    displaySongInfo(data.song, lyrics || "Зареждане на текста...", data.chords);
    displaySoundCloudPlayer(data.song.soundcloud_url);
    displayChords(data.chords);

    currentSongData = {
      song: data.song,
      lyrics: lyrics || "",
      chords: data.chords,
    };

    if (!lyrics || lyrics.trim() === "") {
      const artist = data.song.artist;
      const title = data.song.title;

      fetchLyricsFromAPI(songId, artist, title, data.chords).catch(err => {
        console.error("Background lyrics fetch failed:", err);
      });
    }
  } catch (error) {
    console.error("Грешка при зареждане на песен:", error);
    songInfo.innerHTML = '<div class="loading">Грешка при зареждане на песента</div>';
  }
}

async function fetchLyricsFromAPI(songId, artist, title, chords) {
  const fetchWithTimeout = (url, timeout = 6000) => {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API request timeout')), timeout)
      )
    ]);
  };

  try {
    console.log(`Fetching lyrics for "${title}" by "${artist}" from API...`);

    let lyricsResponse = await fetchWithTimeout(
      `${LYRICS_API_URL}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );

    if (!lyricsResponse.ok) {
      throw new Error(`API returned status ${lyricsResponse.status}`);
    }

    const lyricsData = await lyricsResponse.json();

    if (!lyricsData.lyrics) {
      console.warn(`No lyrics found for "${title}" by "${artist}"`);
      return;
    }

    console.log("Lyrics fetched successfully from API");

    const formattedLyrics = formatLyricsWithChords(lyricsData.lyrics, chords);
    await saveLyrics(songId, formattedLyrics);

    displaySongInfo({ artist, title }, formattedLyrics, chords);

    if (currentSongData && currentSongData.song.id === songId) {
      currentSongData.lyrics = formattedLyrics;
    }

    console.log("Lyrics saved to database and display updated");
  } catch (error) {
    console.error("Failed to fetch lyrics from API:", error.message);
  }
}

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

function displaySongInfo(song, lyrics, chords) {
  const songInfo = document.getElementById("songInfo");

  const lyricsWithChords = addChordsToLyrics(lyrics, chords);
  const isFav = isFavorite(song.id);

  songInfo.innerHTML = `
        <div class="song-header">
            <div class="song-title-section">
                <h2>${song.title}</h2>
                <button class="favorite-btn-large ${isFav ? "active" : ""}" id="songFavoriteBtn">
                    ${isFav ? "❤️" : "🤍"}
                </button>
            </div>
            <p class="artist">${song.artist}</p>
        </div>
        <div class="lyrics">${lyricsWithChords || "Текстът на песента не е наличен"}</div>
    `;

  const favBtn = document.getElementById("songFavoriteBtn");
  setupFavoriteButton(song.id, favBtn);

  attachChordClickListeners(chords);
}
