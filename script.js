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

// Page Load - Fetch Auto Update Endpoints
document.addEventListener("DOMContentLoaded", () => {
  // ၁။ ယနေ့ ရေပန်းအစားဆုံး
  fetchMovies(`${BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`, "trendingToday", "mixed");
  
  // ၂။ လတ်တလော ထွက်ရှိထားသော ရုပ်ရှင်အသစ်များ (Auto Updates)
  fetchMovies(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`, "nowPlayingMovies", "movie");
  
  // ၃။ လတ်တလော ထုတ်လွှင့်နေသော ဇာတ်လမ်းတွဲများ (Auto Updates)
  fetchMovies(`${BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}`, "onAirSeries", "tv");
  
  // ၄။ မကြာမီ ထွက်ရှိမည့် ရုပ်ရှင်များ (Upcoming)
  fetchMovies(`${BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`, "upcomingMovies", "movie");
});

// Real-Time Search
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

// Fetch Content & Display Cards
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
      const genreNames = item.genre_ids ? item.genre_ids.map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(", ") : "Unknown";

      const card = document.createElement("div");
      card.className = "movie-card";

      card.innerHTML = `
        <div class="poster-wrapper">
          <img src="${poster}" alt="${title}" loading="lazy">
          <div class="badge-trailer"><i class="fa-solid fa-play"></i> Trailer</div>
          <div class="badge-rating"><i class="fa-solid fa-star"></i> ${rating}</div>
        </div>
        <div class="card-info">
          <h3>${title}</h3>
          <div class="card-meta">${year}</div>
          <div class="card-genres">${genreNames}</div>
        </div>
      `;

      // Card Click -> Play YouTube Trailer
      card.addEventListener("click", () => {
        playYouTubeTrailer(item.id, mediaType);
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

// Fetch Official YouTube Trailer from TMDb API & Embed
async function playYouTubeTrailer(id, type) {
  const modal = document.getElementById("playerModal");
  const iframe = document.getElementById("videoIframe");
  const actualType = type === 'tv' ? 'tv' : 'movie';

  try {
    const videoUrl = `${BASE_URL}/${actualType}/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
    const res = await fetch(videoUrl);
    const data = await res.json();

    // YouTube Official Trailer ကို အဓိက ရှာမည်
    let trailer = data.results.find(v => v.site === "YouTube" && v.type === "Trailer");
    
    // Trailer သီးသန့်မတွေ့ပါက အခြား YouTube Video (Teaser/Clip) ကို ရှာမည်
    if (!trailer) {
      trailer = data.results.find(v => v.site === "YouTube");
    }

    if (trailer) {
      // YouTube Embed Video Player ကို Autoplay ဖြင့် ပွင့်စေမည်
      iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
      modal.style.display = "flex";
    } else {
      alert("ဒီရုပ်ရှင်/ဇာတ်လမ်းတွဲအတွက် Official YouTube Trailer မတွေ့ရှိသေးပါဗျာ။");
    }
  } catch (err) {
    console.error("Trailer Error:", err);
    alert("Trailer ခေါ်ယူရာတွင် အမှားအယွင်းရှိနေပါသည်။");
  }
}

// Close Modal logic
document.getElementById("closeModal").addEventListener("click", () => {
  const modal = document.getElementById("playerModal");
  const iframe = document.getElementById("videoIframe");
  iframe.src = ""; // Stop video playback
  modal.style.display = "none";
});
