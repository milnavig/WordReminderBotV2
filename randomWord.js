require('dotenv').config();
const token = require('google-translate-token');
const translate = require('translate');

function sendRandomWord(bot, words) {
  const sendOneWord = () => {
    const current_hour = new Date().getHours();
    if (current_hour < process.env.START_HOUR && current_hour > process.env.END_HOUR) return;

    token.get('Token').then(res => {
      translate.engine = "google"; // Or "yandex", "libre", "deepl"
      translate.key = res.value;
    }).then(() => {
      const words_num = words.length;
      const random_id = Math.round(Math.random() * words_num);

      const options = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: 'Вивчати', callback_data: `learn_${random_id}` }],
            [{ text: 'Приклади використання', callback_data: `context_${random_id}` }, { text: 'Синоніми', callback_data: `synonym_${random_id}` }],
          ]
        })
      };
      console.log(`Word id is ${random_id}`);

      const [word_popularity, word_english, part_of_speech] = words[random_id];
      translate(word_english, { to: "uk" }).then(word_ukrainian => {
        bot.sendMessage(process.env.CHAT_ID, generateString(word_popularity, word_english, word_ukrainian, part_of_speech), options);
      });
    });
  }

  setInterval(sendOneWord, process.env.TIME_INTERVAL * 60 * 1000);
}

function sendRandomWords(bot, num, words) {
  const current_hour = new Date().getHours();
  if (current_hour < process.env.START_HOUR && current_hour > process.env.END_HOUR) return;

  token.get('Token').then(res => {
    translate.engine = "google"; // Or "yandex", "libre", "deepl"
    translate.key = res.value;
  }).then(() => {
    const words_num = words.length;
    const ids = new Array(num).fill(0).map(id => Math.round(Math.random() * words_num));

    Promise.all(ids.map(id => {
      const [, word_english] = words[id];
      return translate(word_english, { to: "uk" });
    })).then(results => {
      let words_text = results.map((word_ukrainian, id) => {
        const [word_popularity, word_english, part_of_speech] = words[ids[id]];
        //return [word_popularity, word_english, word_ukrainian];
        return generateString(word_popularity, word_english, word_ukrainian, part_of_speech, id);
      });
      bot.sendMessage(process.env.CHAT_ID, words_text.join('\n'));
    });
  });
}

function generateString(word_popularity, word_english, word_ukrainian, part_of_speech, id = null) {
  let isList = id !== null ? `${id} ` : ``;
  return isList + `🈂️ ${word_popularity} 🇺🇸 ${word_english} 🇺🇦 ${word_ukrainian} | ${part_of_speech}`;
}

module.exports = {
  sendRandomWord,
  sendRandomWords,
}