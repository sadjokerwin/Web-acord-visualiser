document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const songId = urlParams.get("song");

  if (songId) {
    loadSongDetails(parseInt(songId));
  } else {
    showHomePage();
  }

  loadSongs();
  setupBackButton();
  setupExportButton();
  setupExportJsonButton();
  setupExportCsvButton();
  setupSearchAndFilters();
  setupExportDropdown();
  setupImportButton();
});

// Handle browser back/forward buttons
window.addEventListener("popstate", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const songId = urlParams.get("song");

  if (songId) {
    loadSongDetails(parseInt(songId));
  } else {
    showHomePage();
  }
});
