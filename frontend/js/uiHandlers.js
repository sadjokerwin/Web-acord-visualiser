// UI Handlers Module - event handlers and navigation

// Setup back button
function setupBackButton() {
  const backButton = document.getElementById("backButton");
  backButton.addEventListener("click", () => {
    showHomePage();
  });
}

// Setup export button
function setupExportButton() {
  const exportButton = document.getElementById("exportPdfButton");
  exportButton.addEventListener("click", () => {
    if (currentSongData) {
      exportToPDF(currentSongData.song, currentSongData.lyrics, currentSongData.chords);
    } else {
      alert("Няма заредена песен за експорт!");
    }
  });
}

// Setup JSON export button
function setupExportJsonButton() {
  const exportButton = document.getElementById("exportJsonButton");
  exportButton.addEventListener("click", () => {
    if (currentSongData) {
      exportToJSON(currentSongData.song, currentSongData.lyrics, currentSongData.chords);
    } else {
      alert("Няма заредена песен за експорт!");
    }
  });
}

// Setup CSV export button
function setupExportCsvButton() {
  const exportButton = document.getElementById("exportCsvButton");
  exportButton.addEventListener("click", () => {
    if (currentSongData) {
      exportToCSV(currentSongData.song, currentSongData.lyrics, currentSongData.chords);
    } else {
      alert("Няма заредена песен за експорт!");
    }
  });
}

// Setup search and filters
function setupSearchAndFilters() {
  const searchInput = document.getElementById("searchInput");
  const artistFilter = document.getElementById("artistFilter");

  searchInput.addEventListener("input", (e) => {
    filterSongs();
  });

  artistFilter.addEventListener("change", (e) => {
    filterSongs();
  });
}

// Setup export dropdown menu
function setupExportDropdown() {
  const exportButton = document.getElementById("exportButton");
  const exportMenu = document.getElementById("exportMenu");

  exportButton.addEventListener("click", (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    exportMenu.classList.remove("show");
  });

  exportMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

// Show home page
function showHomePage() {
  document.getElementById("homePage").style.display = "block";
  document.getElementById("songPage").style.display = "none";

  const url = new URL(window.location);
  url.searchParams.delete("song");
  window.history.pushState({}, "", url);
}

// Show song page
function showSongPage() {
  document.getElementById("homePage").style.display = "none";
  document.getElementById("songPage").style.display = "block";
  window.scrollTo(0, 0);
}
