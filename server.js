const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ အစ်ကို့ရဲ့ Telegram Bot Token နှင့် Admin ID
const BOT_TOKEN = '8795817137:AAFLuA9n5btFJAQbvdggAFlc2UJwEs3BFVg'; 
const BOT_USERNAME = 'flickversecinemabot'; // @ မပါဘဲ ရေးပါ (ဥပမာ- CinemaStreamBot)
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const DB_FILE = './series_db.json';
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

function getDB() { return JSON.parse(fs.readFileSync(DB_FILE)); }
function saveDB(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

// 📩 Admin က Telegram Bot သို့ ဗီဒီယိုဖိုင် ပို့၍ တင်သည့် စနစ်
// Caption ပုံစံ: /upload [TMDb ID] S1 E1
// ဥပမာ: /upload 939243 S1 E1
bot.on('video', (msg) => {
  const chatId = msg.chat.id;
  const caption = msg.caption || '';
  const fileId = msg.video.file_id;
  const fileSize = (msg.video.file_size / (1024 * 1024)).toFixed(1) + 'MB';

  if (caption.startsWith('/upload')) {
    const parts = caption.split(' '); // ['/upload', '939243', 'S1', 'E1']
    if (parts.length < 4) {
      bot.sendMessage(chatId, "⚠️ Format မှားနေပါသည်။\nCaption တွင် `/upload [ID] S1 E1` ဟု ရေးပေးပါ။", { parse_mode: 'Markdown' });
      return;
    }

    const tmdbId = parts[1].trim();
    const season = parts[2].toUpperCase().trim(); // S1
    const episode = parts[3].toUpperCase().trim(); // E1

    const db = getDB();
    if (!db[tmdbId]) db[tmdbId] = {};
    if (!db[tmdbId][season]) db[tmdbId][season] = [];

    // Episode အသစ် ထည့်သွင်းခြင်း
    db[tmdbId][season].push({
      episode: episode,
      file_id: fileId,
      size: fileSize,
      // Telegram Deep Link (Bot ထဲသို့ တိုက်ရိုက် ရောက်ရှိသွားမည်)
      telegram_link: `https://t.me/${BOT_USERNAME}?start=${tmdbId}_${season}_${episode}`
    });

    saveDB(db);
    bot.sendMessage(chatId, `✅ **Episode တင်ပြီးပါပြီ!**\n\n🎬 **ID:** ${tmdbId}\n📺 **Season:** ${season}\n🎞️ **Episode:** ${episode}\n📦 **Size:** ${fileSize}`, { parse_mode: 'Markdown' });
  }
});

// 🤖 User က Telegram Deep Link မှတစ်ဆင့် ဝင်ရောက်ပါက ဖိုင်ပြန်ပို့ပေးခြင်း
bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const param = match[1]; // e.g. 939243_S1_E1
  const parts = param.split('_');

  if (parts.length === 3) {
    const [tmdbId, season, episode] = parts;
    const db = getDB();

    if (db[tmdbId] && db[tmdbId][season]) {
      const epData = db[tmdbId][season].find(e => e.episode === episode);
      if (epData) {
        bot.sendVideo(chatId, epData.file_id, { caption: `🎬 **Episode:** ${season} ${episode}` });
        return;
      }
    }
  }
  bot.sendMessage(chatId, "❌ ဗီဒီယိုဖိုင် မတွေ့ရှိပါ။");
});

// 🌐 Website ဘက်မှ Episode စာရင်း လှမ်းဆွဲယူမယ့် API
app.get('/api/series/:id', (req, res) => {
  const movieId = req.params.id;
  const db = getDB();
  const seriesData = db[movieId] || {};
  res.json({ success: true, seasons: seriesData });
});

app.listen(3000, () => console.log("VPS Backend Running on Port 3000"));
