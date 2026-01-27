// Favorites Manager Module - managing favorite songs

// Get favorites from localStorage
function getFavorites() {
  const favorites = localStorage.getItem("favoriteSongs");
  return favorites ? JSON.parse(favorites) : [];
}

// Save favorites to localStorage
function saveFavorites(favorites) {
  localStorage.setItem("favoriteSongs", JSON.stringify(favorites));
}

// Check if song is favorite
function isFavorite(songId) {
  const favorites = getFavorites();
  return favorites.includes(songId);
}

// Toggle favorite status
function toggleFavorite(songId) {
  let favorites = getFavorites();

  if (favorites.includes(songId)) {
    // Remove from favorites
    favorites = favorites.filter((id) => id !== songId);
  } else {
    // Add to favorites
    favorites.push(songId);
  }

  saveFavorites(favorites);
  return favorites.includes(songId);
}

// Get favorite songs from all songs
function getFavoriteSongs() {
  const favorites = getFavorites();
  return allSongs.filter((song) => favorites.includes(song.id));
}

// Setup favorite button click handler
function setupFavoriteButton(songId, buttonElement) {
  buttonElement.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent song card click
    const isFav = toggleFavorite(songId);
    updateFavoriteButton(buttonElement, isFav);
  });
}

// Update favorite button appearance
function updateFavoriteButton(buttonElement, isFav) {
  if (isFav) {
    buttonElement.classList.add("active");
    buttonElement.innerHTML = "❤️";
    buttonElement.setAttribute("title", "Премахни от любими");
  } else {
    buttonElement.classList.remove("active");
    buttonElement.innerHTML = "🤍";
    buttonElement.setAttribute("title", "Добави в любими");
  }
}
