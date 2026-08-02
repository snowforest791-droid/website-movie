const TMDB_API_KEY = "a671d00101a4c0b0dbb5ed9703441f3d";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

// Genre Mapping (IDs to Names)
const genreMap = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10765: "Sci-Fi & Fantasy", 10768: "War & Politics"
};

// UI Elements
const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");
const searchInput = document.getElementById("searchInput");
const searchIcon = document.getElementById("searchIcon");

// Sidebar Toggle Logic
function toggleMenu() {
  sideMenu.classList.toggle("active");
  menuOverlay.classList.toggle("active");
}
menuBtn.addEventListener("click", toggleMenu);
closeMenuBtn.addEventListener("click", toggleMenu);
menuOverlay.addEventListener("click", toggleMenu);
searchIcon.addEventListener("click", toggleMenu);

document.addEventListener("DOMContentLoaded", () => {
  fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`, "trendingMovies", "movie");
  fetchMovies(`${BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}`, "trendingSeries", "tv");
  fetchMovies(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`, "moviesGrid", "movie");
});

// Search functionality
let delayTimer;
searchInput.addEventListener("input", (e) => {
  clearTimeout(delayTimer);
  const query = e.target.value.trim();
  delayTimer = setTimeout(() => {
    if (query) {
      document.getElementById("mainContent").innerHTML = `
        <section class="content-section">
          <div class="section-header"><h2>Search Results for "${query}"</h2></div>
          <div class="grid-container" id="searchGrid"></div>
        </section>
      `;
      fetchMovies(`${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`, "searchGrid", "mixed");
      toggleMenu(); // Close menu after searching
    } else {
      location.reload(); // Reload home if search is empty
    }
  }, 800);
});

// Fetch and Render Content
async function fetchMovies(url, containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.results.length === 0) {
      container.innerHTML = "<p style='padding: 20px; color: #888;'>No results found.</p>";
      return;
    }

    container.innerHTML = ""; // Clear loader
    data.results.forEach(item => {
      // Skip persons in mixed search
      if (item.media_type === "person") return; 

      const currentType = item.media_type || type; // Determine if movie or tv
      const title = item.title || item.name;
      const releaseDate = item.release_date || item.first_air_date || "";
      const year = releaseDate ? releaseDate.split("-")[0] : "N/A";
      const rating = item.vote_average ? item.vote_average.toFixed(1) : "NR";
      const poster = item.poster_path ? IMG_URL + item.poster_path : "https://via.placeholder.com/500x750?text=No+Poster";
      
      // Convert Genre IDs to text (Take up to 2 genres)
      const genreNames = item.genre_ids ? item.genre_ids.map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(", ") : "Unknown";

      // HTML Structure for Card
      const card = document.createElement("div");
      card.className = "movie-card";
      
      let seasonBadge = "";
      if (currentType === "tv") {
        // Mocking season count for UI visual (API requires separate fetch per TV show for real season count)
        seasonBadge = `<div class="badge-season">TV Series</div>`; 
      }

      card.innerHTML = `
        <div class="poster-wrapper">
          <img src="${poster}" alt="${title}">
          <div class="badge-quality">HD</div>
          <div class="badge-rating"><i class="fa-solid fa-star"></i> ${rating}</div>
          ${seasonBadge}
        </div>
        <div class="card-info">
          <h3>${title}</h3>
          <div class="card-meta">${year}</div>
          <div class="card-genres">${genreNames}</div>
        </div>
      `;

      card.addEventListener("click", () => {
        playAutoEmbed(item.id, currentType);
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Player Logic (VidSrc.pro)
function playAutoEmbed(id, type) {
  const modal = document.getElementById("playerModal");
  const iframe = document.getElementById("videoIframe");
  
  // Clean 'mixed' type from search API
  const actualType = type === 'tv' ? 'tv' : 'movie'; 
  
  let embedUrl = `https://vidsrc.pro/embed/${actualType}/${id}`;
  if (actualType === 'tv') {
    embedUrl += `/1/1`; // Default to S1 E1
  }

  iframe.src = embedUrl;
  modal.style.display = "flex";
}

document.getElementById("closeModal").addEventListener("click", () => {
  const modal = document.getElementById("playerModal");
  const iframe = document.getElementById("videoIframe");
  iframe.src = "";
  modal.style.display = "none";
});
