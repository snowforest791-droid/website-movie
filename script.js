// ==========================================
// ၁။ API Key နှင့် ကိုယ်ပိုင် Link များ ထည့်ရန်နေရာ
// ==========================================
const TMDB_API_KEY = "a671d00101a4c0b0dbb5ed9703441f3d";

const myMovieLinks = {
  "1083381": "https://t.me/c/4351330970/6/60", // Backrooms
  "1339713": "https://t.me/c/4351330970/6/39", // Obsessions
  "1202033": "https://t.me/c/4351330970/6/41", // Enola Holmes 3
  "1259253": "https://t.me/c/4351330970/6/59"  // Passenger
};

// ==========================================
// ၂။ ရုပ်ရှင်များ ခေါ်ယူပြသခြင်း
// ==========================================
async function fetchMovies() {
  const grid = document.getElementById("movieGrid");

  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    const data = await res.json();

    grid.innerHTML = ""; // Loading စာတန်းကို ရှင်းထုတ်မည်

    data.results.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";

      const posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

      const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

      card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}">
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <p>⭐ ${rating} | 📅 ${releaseYear}</p>
        </div>
      `;

      // Movie Card နှိပ်လိုက်ပါက Link ပွင့်မည့် Logic
      card.addEventListener("click", () => {
        const movieIdStr = String(movie.id);
        
        if (myMovieLinks[movieIdStr]) {
          window.open(myMovieLinks[movieIdStr], "_blank");
        } else {
          alert(`"${movie.title}" အတွက် Link မထည့်ရသေးပါဗျာ။`);
        }
      });

      grid.appendChild(card);
    });

  } catch (error) {
    console.error("Error fetching movies:", error);
    grid.innerHTML = "<p style='color:red; text-align:center; grid-column:1/-1;'>ရုပ်ရှင်များ ဒေါင်းလုဒ်ဆွဲ၍ မရပါ၊ လိုင်းပြန်စစ်ပေးပါ။</p>";
  }
}

// Page စတက်သည်နှင့် ခေါ်မည်
document.addEventListener("DOMContentLoaded", fetchMovies);
