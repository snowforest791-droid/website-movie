const TMDB_API_KEY = "a671d00101a4c0b0dbb5ed9703441f3d";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

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

// Sidebar Toggle
function toggleMenu() {
  sideMenu.classList.toggle("active");
  menuOverlay.classList.toggle("active");
}
menuBtn.addEventListener("click", toggleMenu);
closeMenuBtn.addEventListener("click", toggleMenu);
menuOverlay.addEventListener("click", toggleMenu);
searchIcon.addEventListener("click", toggleMenu);

// Load Main Lists
document.addEventListener("DOMContentLoaded", () => {
  fetchMovies(`${BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`, "trendingToday", "mixed");
  fetchMovies(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`, "nowPlayingMovies", "movie");
  fetchMovies(`${BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}`, "onAirSeries", "tv");
  fetchMovies(`${BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`, "upcomingMovies", "movie");
});

// Search Logic
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
      toggleMenu();
    } else {
      location.reload();
    }
  }, 600);
});

// Fetch Movies Grid/Scroll list
async function fetchMovies(url, containerId, defaultType) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      container.innerHTML = "<p class='loading'>အချက်အလက် မတွေ့ရှိပါ။</p>";
      return;
    }

    container.innerHTML = "";
    data.results.forEach(item => {
      if (item.media_type === "person") return;

      const mediaType = item.media_type || defaultType;
      const title = item.title || item.name;
      const releaseDate = item.release_date || item.first_air_date || "";
      const year = releaseDate ? releaseDate.split("-")[0] : "N/A";
      const rating = item.vote_average ? item.vote_average.toFixed(1) : "NR";
      const poster = item.poster_path ? IMG_URL + item.poster_path : "https://via.placeholder.com/500x750?text=No+Poster";
      const genreNames = item.genre_ids ? item.genre_ids.map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(", ") : "Movie";

      const card = document.createElement("div");
      card.className = "movie-card";

      card.innerHTML = `
        <div class="poster-wrapper">
          <img src="${poster}" alt="${title}" loading="lazy">
          <div class="badge-rating"><i class="fa-solid fa-star"></i> ${rating}</div>
        </div>
        <div class="card-info">
          <h3>${title}</h3>
          <div class="card-meta">${year}</div>
          <div class="card-genres">${genreNames}</div>
        </div>
      `;

      // Card နှိပ်လိုက်ပါက Detail Box (Synopsis + Downloads) ပွင့်မည်
      card.addEventListener("click", () => {
        openMovieDetail(item.id, mediaType);
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

// 🎬 Fetch Movie Details, Synopsis & Download Links
async function openMovieDetail(id, type) {
  const actualType = type === 'tv' ? 'tv' : 'movie';
  const detailModal = document.getElementById("detailModal");
  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = "<p style='color:#fff;'>အချက်အလက်များကို ခေါ်ယူနေပါသည်...</p>";
  detailModal.style.display = "flex";

  try {
    const res = await fetch(`${BASE_URL}/${actualType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos`);
    const data = await res.json();

    const title = data.title || data.name;
    const releaseDate = data.release_date || data.first_air_date || "";
    const year = releaseDate ? releaseDate.split("-")[0] : "N/A";
    const overview = data.overview || "ဇာတ်လမ်းအညွှန်း မရှိသေးပါ။";

    // Trailer Key
    let trailerKey = "";
    if (data.videos && data.videos.results.length > 0) {
      const trailer = data.videos.results.find(v => v.site === "YouTube" && v.type === "Trailer") || data.videos.results[0];
      if (trailer) trailerKey = trailer.key;
    }

    // Modal Content HTML (အစ်ကို ပို့ထားတဲ့ ပုံအတိုင်း ဖွဲ့စည်းထားခြင်း)
    modalBody.innerHTML = `
      <div class="tab-header">
        <button class="tab-btn active">Synopsis</button>
        <button class="tab-btn" onclick="alert('Cast List feature coming soon!')">Cast List</button>
      </div>

      <div class="synopsis-box">
        <h2 class="synopsis-title">${title} (${year})</h2>
        <div class="synopsis-divider">****************************</div>
        <p class="synopsis-text">${overview}</p>
      </div>

      ${trailerKey ? `
        <div class="trailer-btn-container">
          <button class="watch-trailer-btn" onclick="playTrailer('${trailerKey}')">
            <i class="fa-solid fa-play"></i> Watch Official Trailer
          </button>
        </div>
      ` : ''}

      <div class="download-section">
        <h2 class="download-section-title">Download Links</h2>
        <table class="download-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Server Name</th>
              <th>Size</th>
              <th>Resolution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td><a href="https://usersdrive.com" target="_blank" class="server-link">Usersdrive</a></td>
              <td>1.60GB</td>
              <td><span class="res-badge res-1080p">1080p FULL HD</span></td>
            </tr>
            <tr>
              <td>2</td>
              <td><a href="https://megaup.net" target="_blank" class="server-link">Megaup</a></td>
              <td>1.60GB</td>
              <td><span class="res-badge res-1080p">1080p FULL HD</span></td>
            </tr>
            <tr>
              <td>3</td>
              <td><a href="https://yoteshin.com" target="_blank" class="server-link">Yoteshin</a></td>
              <td>1.60GB</td>
              <td><span class="res-badge res-1080p">1080p FULL HD</span></td>
            </tr>
            <tr>
              <td>4</td>
              <td><a href="https://usersdrive.com" target="_blank" class="server-link">Usersdrive</a></td>
              <td>851MB</td>
              <td><span class="res-badge res-720p">720p HD</span></td>
            </tr>
            <tr>
              <td>5</td>
              <td><a href="https://megaup.net" target="_blank" class="server-link">Megaup</a></td>
              <td>851MB</td>
              <td><span class="res-badge res-720p">720p HD</span></td>
            </tr>
            <tr>
              <td>6</td>
              <td><a href="https://yoteshin.com" target="_blank" class="server-link">Yoteshin</a></td>
              <td>851MB</td>
              <td><span class="res-badge res-720p">720p HD</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

  } catch (err) {
    console.error("Detail Error:", err);
    modalBody.innerHTML = "<p style='color:red;'>အချက်အလက်များ ခေါ်ယူရာတွင် အမှားအယွင်း ရှိနေပါသည်။</p>";
  }
}

// Open Trailer Video
function playTrailer(key) {
  const trailerModal = document.getElementById("trailerModal");
  const iframe = document.getElementById("trailerIframe");
  iframe.src = `https://www.youtube.com/embed/${key}?autoplay=1`;
  trailerModal.style.display = "flex";
}

// Close Modals Logic
document.getElementById("closeDetailModal").addEventListener("click", () => {
  document.getElementById("detailModal").style.display = "none";
});

document.getElementById("closeTrailerModal").addEventListener("click", () => {
  const trailerModal = document.getElementById("trailerModal");
  const iframe = document.getElementById("trailerIframe");
  iframe.src = "";
  trailerModal.style.display = "none";
});
