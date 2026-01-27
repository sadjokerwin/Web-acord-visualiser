// Song Manager Module - song list management and filtering

// Load all songs from database
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

// Display songs in the grid
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

// Populate artist filter dropdown
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

// Create song card element
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

  // Add click handler for card
  div.addEventListener("click", (e) => {
    if (!e.target.classList.contains("favorite-btn")) {
      loadSongDetails(song.id);
    }
  });

  // Setup favorite button
  const favBtn = div.querySelector(".favorite-btn");
  setupFavoriteButton(song.id, favBtn);

  return div;
}

// Filter songs based on search and artist filter
function filterSongs() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const selectedArtist = document.getElementById("artistFilter").value;
  const showFavoritesOnly = document.getElementById("favoritesFilter")?.checked || false;

  let filteredSongs = allSongs;

  // Filter by favorites
  if (showFavoritesOnly) {
    filteredSongs = getFavoriteSongs();
  }

  // Filter by artist if selected
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
