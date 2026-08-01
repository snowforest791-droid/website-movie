// ==========================================
// ၁။ API Key နှင့် ကိုယ်ပိုင် Link များ ထည့်ရန်နေရာ
// ==========================================
const TMDB_API_KEY = "a671d00101a4c0b0dbb5ed9703441f3d"; // သင့် TMDb API Key ထည့်ပါ

// 🌟 ဒီနေရာမှာ ရုပ်ရှင် ID နံပါတ်နဲ့ Link ကို ယှဉ်ထည့်ပေးရုံပါပဲ 🌟
const myMovieLinks = {
  "1083381": "https://t.me/c/4351330970/6/60",   // backrooms
  "299536": "https://drive.google.com/file/d/xxx",  // Avengers
  "1227877": "https://t.me/c/4351330970/6/33",  // i love booster
  "1202033": "https://t.me/c/4351330970/6/41"     //enola 3
};


// ==========================================
// ၂။ ရုပ်ရှင်များ ခေါ်ယူပြသခြင်း (အရှင်းဆုံး ပုံစံ)
// ==========================================
async function fetchMovies(url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`) {
  const grid = document.getElementById("movieGrid");
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    grid.innerHTML = ""; // အဟောင်းများကို ရှင်းထုတ်မည်

    data.results.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";

      // ရုပ်ရှင် Poster နှင့် စာအချက်အလက်များ
      const poster = movie.poster_path ? `https://image.tmdb.org/tpb/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750';
      const year = (movie.release_date || "").split("-")[0] || "N/A";
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "NR";

      card.innerHTML = `
        <div class="poster-box">
          <img src="${poster}">
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.title}</h3>
          <div class="movie-meta">
            <span class="rating">★ ${rating}</span>
            <span class="year">${year}</span>
          </div>
        </div>
      `;

      // 🌟 ရုပ်ရှင်ကို Click နှိပ်လိုက်ရင် လုပ်ဆောင်မည့်အရာ 🌟
      card.onclick = () => {
        const id = movie.id.toString();

        if (myMovieLinks[id]) {
          // Link ထည့်ထားရင် အဲဒီ Link ဆီ တိုက်ရိုက်သွားမည်
          window.open(myMovieLinks[id], '_blank');
        } else {
          // Link မထည့်ရသေးရင် အသိပေးမည်
          alert(`"${movie.title}" အတွက် Link မထည့်ရသေးပါခင်ဗျာ။`);
        }
      };

      grid.appendChild(card);
    });

  } catch (error) {
    grid.innerHTML = "<p>Data ခေါ်မရပါ။ API Key သေချာ ထည့်ထားလား စစ်ပေးပါ။</p>";
  }
}

// Search လုပ်သည့် စနစ်
function searchMovie() {
  const query = document.getElementById("searchInput").value;
  if (query) {
    fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
  } else {
    fetchMovies();
  }
}

// App စတင်ပွင့်ချိန်တွင် ရုပ်ရှင်များ ခေါ်ပြမည်
document.addEventListener("DOMContentLoaded", () => {
  fetchMovies();
});
