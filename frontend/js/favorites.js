function getFavorites() {
  const favorites = localStorage.getItem("favoriteSongs");
  return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favoriteSongs", JSON.stringify(favorites));
}

function isFavorite(songId) {
  const favorites = getFavorites();
  return favorites.includes(songId);
}

function toggleFavorite(songId) {
  let favorites = getFavorites();

  if (favorites.includes(songId)) {
    favorites = favorites.filter((id) => id !== songId);
  } else {
    favorites.push(songId);
  }

  saveFavorites(favorites);
  return favorites.includes(songId);
}

function getFavoriteSongs() {
  const favorites = getFavorites();
  return allSongs.filter((song) => favorites.includes(song.id));
}

function setupFavoriteButton(songId, buttonElement) {
  buttonElement.addEventListener("click", (e) => {
    e.stopPropagation();
    const isFav = toggleFavorite(songId);
    updateFavoriteButton(buttonElement, isFav);
  });
}

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
