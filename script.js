// 🎬 Fetch Movie Details & Fetch Telegram Episodes from VPS
async function openMovieDetail(id, type) {
  const actualType = type === 'tv' ? 'tv' : 'movie';
  const detailModal = document.getElementById("detailModal");
  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = "<p style='color:#fff;'>အချက်အလက်များကို ခေါ်ယူနေပါသည်...</p>";
  detailModal.style.display = "flex";

  try {
    // 1. TMDb မှ ရုပ်ရှင်/Series Metadata ယူခြင်း
    const res = await fetch(`${BASE_URL}/${actualType}/${id}?api_key=${TMDB_API_KEY}`);
    const data = await res.json();

    const title = data.title || data.name;
    const releaseDate = data.release_date || data.first_air_date || "";
    const year = releaseDate ? releaseDate.split("-")[0] : "N/A";
    const overview = data.overview || "ဇာတ်လမ်းအညွှန်း မရှိသေးပါ။";

    // 2. VPS API မှ Telegram ပေါ်ရှိ Episodes များ ခေါ်ယူခြင်း
    // ⚠️ YOUR_VPS_IP တွင် မိမိ VPS ရဲ့ IP အစားထိုးပါ
    const vpsRes = await fetch(`http://YOUR_VPS_IP:3000/api/series/${id}`);
    const vpsData = await vpsRes.json();
    const seasonsData = vpsData.seasons; // { "S1": [...], "S2": [...] }

    let episodesHTML = "";

    if (Object.keys(seasonsData).length > 0) {
      for (const seasonName in seasonsData) {
        episodesHTML += `<h3 style="color:#2a6df5; margin-top:15px;">${seasonName}</h3><div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px;">`;
        
        seasonsData[seasonName].forEach(ep => {
          episodesHTML += `
            <a href="${ep.telegram_link}" target="_blank" style="
              background: #1c2536; color: #fff; text-decoration: none;
              padding: 10px 15px; border-radius: 6px; font-weight: bold;
              display: inline-flex; align-items: center; gap: 8px; border: 1px solid #2a374e;">
              <i class="fa-solid fa-paper-plane" style="color: #0088cc;"></i>
              ${ep.episode} (${ep.size})
            </a>
          `;
        });

        episodesHTML += `</div>`;
      }
    } else {
      episodesHTML = `<p style="color: #8b99af; padding: 15px 0;">ဒီဇာတ်လမ်းတွဲအတွက် Telegram တွင် အပိုင်းများ တင်ရသေးပါဘူးဗျာ။</p>`;
    }

    // Modal UI Render
    modalBody.innerHTML = `
      <div class="synopsis-box">
        <h2 class="synopsis-title">${title} (${year})</h2>
        <div class="synopsis-divider">****************************</div>
        <p class="synopsis-text">${overview}</p>
      </div>

      <div class="episodes-section" style="margin-top:20px;">
        <h2 style="font-size:16px; color:#fff;">📺 Available Episodes (Telegram)</h2>
        ${episodesHTML}
      </div>
    `;

  } catch (err) {
    console.error("Detail Error:", err);
    modalBody.innerHTML = "<p style='color:red;'>အချက်အလက်များ ခေါ်ယူရာတွင် အမှားအယွင်း ရှိနေပါသည်။</p>";
  }
}
