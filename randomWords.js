require('dotenv').config();
const token = require('google-translate-token');
const translate = require('translate');

function sendRandomWord(bot, words, user) {
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
            [{ text: 'Вивчати', callback_data: `memorize_${random_id}` }],
            [{ text: 'Приклади використання', callback_data: `context_${random_id}` }, { text: 'Синоніми', callback_data: `synonym_${random_id}` }],
          ]
        })
      };
      console.log(`Word id is ${random_id}`);

      const [word_popularity, word_english, part_of_speech] = words[random_id];
      translate(word_english, { to: "uk" }).then(word_ukrainian => {
        bot.sendMessage(user.chatId, generateString(word_popularity, word_english, word_ukrainian, part_of_speech), options);
      });
    }).catch(err => console.log('Problem with Google translator'));
  }

  setInterval(sendOneWord, user.interval * 60 * 1000);
}

function sendRandomWords(bot, num, words) {
  if (words.length === 0) bot.sendMessage(process.env.CHAT_ID, 'Відсутні слова для вивчення');
  if (words.length < num) num = words.length;
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
  }).catch(err => console.log('Problem with Google translator'));
}

function getPartOfSpeech(part) {
  switch(part) {
    case 'n':
      return 'noun';
    case 'p':
      return 'pronoun';
    case 'v':
      return 'verb';
    case 'a':
      return 'adjective';
    case 'c':
      return 'conjunction';
    case 'i':
      return 'interjection';
    default:
      return part;
  }
}

function generateString(word_popularity, word_english, word_ukrainian, part_of_speech, id = null) {
  let isList = id !== null ? `${id + 1} ` : ``;
  return isList + `🈂️ ${word_popularity} 🇺🇸 ${word_english} 🇺🇦 ${word_ukrainian} (${getPartOfSpeech(part_of_speech)})`;
}

module.exports = {
  sendRandomWord,
  sendRandomWords,
}