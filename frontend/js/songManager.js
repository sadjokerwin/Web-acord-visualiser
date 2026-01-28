async function loadSongs() {
  try {
    const response = await fetch(`${API_BASE_URL}/get_songs.php`);
    const songs = await response.json();

    allSongs = songs;
    populateArtistFilter(songs);
    displaySongs(songs);
  } catch (error) {
    console.error("Грешка при зареждане на песни:", error);
  }
}

function displaySongs(songs) {
  const songsGrid = document.getElementById("songsGrid");
  songsGrid.innerHTML = "";

  if (songs.length === 0) {
    songsGrid.innerHTML =
      '<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1; padding: 40px;">Няма намерени песни</p>';
    return;
  }

  songs.forEach((song) => {
    const songCard = createSongCard(song);
    songsGrid.appendChild(songCard);
  });
}

function populateArtistFilter(songs) {
  const artistFilter = document.getElementById("artistFilter");
  const artists = [...new Set(songs.map((song) => song.artist))].sort();

  artistFilter.innerHTML = '<option value="">Всички изпълнители</option>';

  artists.forEach((artist) => {
    const option = document.createElement("option");
    option.value = artist;
    option.textContent = artist;
    artistFilter.appendChild(option);
  });
}

function createSongCard(song) {
  const div = document.createElement("div");
  div.className = "song-card";

  const isFav = isFavorite(song.id);

  div.innerHTML = `
        <button class="favorite-btn ${isFav ? "active" : ""}" data-song-id="${song.id}">
            ${isFav ? "❤️" : "🤍"}
        </button>
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
    `;

  div.addEventListener("click", (e) => {
    if (!e.target.classList.contains("favorite-btn")) {
      loadSongDetails(song.id);
    }
  });

  const favBtn = div.querySelector(".favorite-btn");
  setupFavoriteButton(song.id, favBtn);

  return div;
}

function filterSongs() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const selectedArtist = document.getElementById("artistFilter").value;
  const showFavoritesOnly = document.getElementById("favoritesFilter")?.checked || false;

  let filteredSongs = allSongs;

  if (showFavoritesOnly) {
    filteredSongs = getFavoriteSongs();
  }

  if (selectedArtist) {
    filteredSongs = filteredSongs.filter((song) => song.artist === selectedArtist);
  }

  if (searchTerm) {
    filteredSongs = filteredSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm),
    );
  }

  displaySongs(filteredSongs);
}
