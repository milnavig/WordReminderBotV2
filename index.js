require('dotenv').config();
const {sendRandomWord, sendRandomWords} = require('./randomWord');
const parseCSV = require('./parseCSV');
const getContext = require('./wordContext');
const getSynonyms = require('./wordSynonyms');
const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '5432458948:AAGZGFS0oNeO6o4K6dumHvZNEXUJHFRAK1c';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

/* // Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId);

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
}); */

parseCSV(process.env.WORDS_PATH).then(words => {
  bot.onText(/\/menu/, (msg, match) => {
    const chatId = msg.chat.id;
  
    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '10 випадкових слів', callback_data: '10_random_words' }, { text: '15 випадкових слів', callback_data: '15_random_words' }],
        ]
      })
    };
  
    bot.sendMessage(chatId, 'Оберіть кількість слів:', options);
  });
  
  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    /* const msg = callbackQuery.message;
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    }; */
  
    if (action === '10_random_words') {
      sendRandomWords(bot, 10, words);
    } else if (action === '15_random_words') {
      sendRandomWords(bot, 15, words);
    } else if (action.startsWith('context_')) {
      const word_id = +action.replace('context_', '');
      getContext(bot, words[word_id][1]);
    } else if (action.startsWith('synonym_')) {
      const word_id = +action.replace('synonym_', '');
      getSynonyms(bot, words[word_id][1]);
    }
  });
  
  bot.on("polling_error", console.log);
  
  sendRandomWord(bot, words);
});
