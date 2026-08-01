const TMDB_API_KEY = "a671d00101a4c0b0dbb5ed9703441f3d";

// အစ်ကို့ရဲ့ ကိုယ်ပိုင် Manual Link များ (မရှိပါက Auto Player ဖြင့် ပွင့်မည်)
const myMovieLinks = {
  "1083381": "https://t.me/c/4351330970/6/60", // Backrooms
  "1339713": "https://t.me/c/4351330970/6/39", // Obsessions
  "1202033": "https://t.me/c/4351330970/6/41", // Enola Holmes 3
  "1259253": "https://t.me/c/4351330970/6/59"  // Passenger
};

let currentType = "movie"; // 'movie' သို့မဟုတ် 'tv'

document.addEventListener("DOMContentLoaded", () => {
  fetchGenres();
  fetchContent();

  // Event Listeners
  document.getElementById("typeSelect").addEventListener("change", (e) => {
    currentType = e.target.value;
    fetchGenres();
    fetchContent();
  });

  document.getElementById("genreSelect").addEventListener("change", fetchContent);
  
  let delayTimer;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(() => {
      fetchContent();
    }, 500);
  });

  document.getElementById("closeModal").addEventListener("click", closeModal);
});

// Genres (အမျိုးအစား) ခေါ်ယူခြင်း
async function fetchGenres() {
  const genreSelect = document.getElementById("genreSelect");
  try {
    const res = await fetch(`https://api.themoviedb.org/3/genre/${currentType}/list?api_key=${TMDB_API_KEY}&language=en-US`);
    const data = await res.json();
    genreSelect.innerHTML = `<option value="">အမျိုးအစား အားလုံး</option>`;
    data.genres.forEach(g => {
      genreSelect.innerHTML += `<option value="${g.id}">${g.name}</option>`;
    });
  } catch (err) {
    console.error("Genre fetch error:", err);
  }
}

// ရုပ်ရှင်/စီးရီးများ ခေါ်ယူခြင်း
async function fetchContent() {
  const grid = document.getElementById("movieGrid");
  const searchQuery = document.getElementById("searchInput").value.trim();
  const selectedGenre = document.getElementById("genreSelect").value;

  let url = `https://api.themoviedb.org/3/discover/${currentType}?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc`;

  if (searchQuery) {
    url = `https://api.themoviedb.org/3/search/${currentType}?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}`;
  } else if (selectedGenre) {
    url += `&with_genres=${selectedGenre}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    grid.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      grid.innerHTML = `<p class="loading">ရှာဖွေမှု မတွေ့ရှိပါ။</p>`;
      return;
    }

    data.results.forEach(item => {
      const card = document.createElement("div");
      card.className = "movie-card";

      const title = item.title || item.name;
      const releaseDate = item.release_date || item.first_air_date || "";
      const releaseYear = releaseDate ? releaseDate.split("-")[0] : "N/A";
      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

      card.innerHTML = `
        <img src="${posterUrl}" alt="${title}">
        <div class="movie-info">
          <h3>${title}</h3>
          <p>⭐ ${item.vote_average ? item.vote_average.toFixed(1) : "N/A"} | 📅 ${releaseYear}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        const idStr = String(item.id);
        
        // ၁။ Manual Link ရှိလျှင် ထို Link သို့ တိုက်ရိုက်သွားမည်
        if (myMovieLinks[idStr]) {
          window.open(myMovieLinks[idStr], "_blank");
        } 
        // ၂။ မရှိပါက Ads အနည်းဆုံး Auto Embed Player ဖြင့် ပွင့်မည်
        else {
          playAutoEmbed(item.id, currentType);
        }
      });

      grid.appendChild(card);
    });

  } catch (error) {
    console.error("Fetch error:", error);
    grid.innerHTML = "<p class='loading'>အချက်အလက်များ ခေါ်ယူ၍ မရပါ။</p>";
  }
}

// Ads မပါ/နည်းသော Auto Embed Player သို့ ချိတ်ဆက်ပေးခြင်း
function playAutoEmbed(id, type) {
  const modal = document.getElementById("playerModal");
  const iframe = document.getElementById("videoIframe");
  
  // ပိုမို အဆင်ပြေပြီး မပိတ်နိုင်သော VidSrc Server
  let embedUrl = `https://vidsrc.cc/v2/embed/${type}/${id}`;
  if (type === 'tv') {
    embedUrl += `/1/1`; // TV series အတွက် S1, E1
  }

  iframe.src = embedUrl;
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("playerModal");
  const iframe = document.getElementById("videoIframe");
  iframe.src = "";
  modal.style.display = "none";
}
