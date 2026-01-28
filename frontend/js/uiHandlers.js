function setupBackButton() {
  const backButton = document.getElementById("backButton");
  backButton.addEventListener("click", () => {
    showHomePage();
  });
}

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

function setupSearchAndFilters() {
  const searchInput = document.getElementById("searchInput");
  const artistFilter = document.getElementById("artistFilter");
  const favoritesFilter = document.getElementById("favoritesFilter");

  searchInput.addEventListener("input", (e) => {
    filterSongs();
  });

  artistFilter.addEventListener("change", (e) => {
    filterSongs();
  });

  favoritesFilter.addEventListener("change", (e) => {
    filterSongs();
  });
}

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

function showHomePage() {
  document.getElementById("homePage").style.display = "block";
  document.getElementById("songPage").style.display = "none";

  const url = new URL(window.location);
  url.searchParams.delete("song");
  window.history.pushState({}, "", url);
}

function showSongPage() {
  document.getElementById("homePage").style.display = "none";
  document.getElementById("songPage").style.display = "block";
  window.scrollTo(0, 0);
}
