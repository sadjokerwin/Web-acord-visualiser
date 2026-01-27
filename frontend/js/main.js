// Main Application Initialization

document.addEventListener("DOMContentLoaded", () => {
  // Check if there's a song ID in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const songId = urlParams.get("song");

  if (songId) {
    // Load specific song if ID is in URL
    loadSongDetails(parseInt(songId));
  } else {
    // Show home page
    showHomePage();
  }

  // Initialize all modules
  loadSongs();
  setupBackButton();
  setupExportButton();
  setupExportJsonButton();
  setupExportCsvButton();
  setupSearchAndFilters();
  setupExportDropdown();
  setupImportButton();
});
