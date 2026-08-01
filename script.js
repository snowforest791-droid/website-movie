// ===================================================
// ၁။ API Key နှင့် ကိုယ်ပိုင် Link များ ထည့်ရန်နေရာ
// ===================================================
const TMDB_API_KEY = "a671d00101a4c0b0dbb5ed9703441f3d"; 

// 🌟 ဒီနေရာမှာ ရုပ်ရှင် သို့မဟုတ် စီးရီး ID နံပါတ်နဲ့ Link ကို ယှဉ်ထည့်ပေးရုံပါပဲ 🌟
const myMovieLinks = {
  // Movies (ရုပ်ရှင်များ)
  "1083381": "https://t.me/c/4351330970/6/60", // Backrooms
  "1339713": "https://t.me/c/4351330970/6/39", // Obsessions
  "1202033": "https://t.me/c/4351330970/6/41", // Enola Holmes 3
  "1259253": "https://t.me/c/4351330970/6/59", // Passenger (2026)

  // TV Series (စီးရီးများ)
  "119051":  "https://t.me/c/4351330970/6/70", // Wednesday (ဥပမာ)
  "94605":   "https://t.me/c/4351330970/6/71"  // Arcane (ဥပမာ)
};

// ===================================================
// ၂။ Movies / TV Series များ ခေါ်ယူပြသခြင်း
// ===================================================
async function loadMedia() {
  const grid = document.getElementById("movieGrid");
  const typeSelect = document.getElementById("typeSelect");
  
  // Dropdown မှ ရွေးထားသော အမျိုးအစားကို ယူမည် (Default က 'movie')
  const mediaType = typeSelect ? typeSelect.value : "movie";
  
  // TMDb API URL (Movies သို့မဟုတ် TV Series)
  const url = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    grid.innerHTML = ""; // အဟောင်းများကို ရှင်းထုတ်မည်

    data.results.forEach(item => {
      const card = document.createElement("div");
      card.className = "movie-card";

      // Movie တွင် 'title' / Series တွင် 'name' ကို ယူမည်
      const title = item.title || item.name;
      
      // Movie တွင် 'release_date' / Series တွင် 'first_air_date' ကို ယူမည်
      const rawDate = item.release_date || item.first_air_date || "";
      const year = rawDate ? rawDate.split('-')[0] : "N/A";
      
      // Poster ပုံရိပ်
      const posterPath = item.poster_path 
        ? `https://image.tmdb.org/t500${item.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Poster';

      // Card Element တည်ဆောက်ခြင်း
      card.innerHTML = `
        <img src="${posterPath}" alt="${title}">
        <div class="movie-info">
          <h3>${title}</h3>
          <p>📅 ${year} | ⭐ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</p>
        </div>
      `;

      // နှိပ်လိုက်ပါက Link ပွင့်မည့် စနစ်
      card.onclick = () => {
        const id = item.id.toString();

        if (myMovieLinks[id]) {
          window.open(myMovieLinks[id], '_blank');
        } else {
          alert(`"${title}" အတွက် Link မထည့်ရသေးပါခင်ဗျာ။`);
        }
      };

      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Data ခေါ်ယူရာတွင် အမှားဖြစ်ပေါ်နေသည် - ", error);
  }
}

// Website စတင်ပွင့်သည်နှင့် Data များ ဆွဲယူမည်
document.addEventListener("DOMContentLoaded", loadMedia);
