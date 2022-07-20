require('dotenv').config();
const {sendRandomWord, sendRandomWords} = require('./randomWords');
const parseCSV = require('./parseCSV');
const getContext = require('./wordContext');
const getSynonyms = require('./wordSynonyms');
const {addWordToMemorize, setTimeInterval, getAllUsers, getUser, createUser} = require('./userWords');

// load locallydb
var locallydb = require('locallydb');

// load the database (folder) in './mydb', will be created if doesn't exist 
var db = new locallydb('./db');

// load the collection (file) in './mydb/monsters', will be created if doesn't exist 
var collection = db.collection('chats');

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
          [{ text: '10 слів для вивчення', callback_data: '10_user_words' }, { text: '15 слів для вивчення', callback_data: '15_user_words' }],
        ]
      })
    };
  
    bot.sendMessage(chatId, 'Оберіть кількість слів:', options);
  });

  bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;

    createUser(collection, chatId);
    const user = getUser(collection, chatId);
    sendRandomWord(bot, words, user);
  
    bot.sendMessage(chatId, 'Готово');
  });

  bot.onText(/\/frequency/, (msg, match) => {
    const chatId = msg.chat.id;
  
    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            { text: '5 хвилин', callback_data: 'frequency_5' }, 
            { text: '10 хвилин', callback_data: 'frequency_10' }, 
            { text: '15 хвилин', callback_data: 'frequency_15' }, 
            { text: '30 хвилин', callback_data: 'frequency_30' }, 
          ],
          [
            { text: '1 година', callback_data: 'frequency_60' }, 
            { text: '2 години', callback_data: 'frequency_120' }, 
            { text: '4 години', callback_data: 'frequency_240' }, 
            { text: '6 годин', callback_data: 'frequency_360' }, 
          ],
        ]
      })
    };
  
    bot.sendMessage(chatId, 'Інтервал між словами:', options);
  });

  bot.onText(/\/add (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const word = match[1];

    let wordInDictionary = words.find(w => w[1] === word);
    if (!wordInDictionary) bot.sendMessage(chatId, `В словнику відсутнє слово ${word}`);
    addWordToMemorize(collection, chatId, wordInDictionary).then(() => {
      bot.sendMessage(chatId, `Слово ${word} додано до Вашого словника`);
    });
  });
  
  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
  
    if (action === '10_random_words') {
      sendRandomWords(bot, 10, words);
    } else if (action === '15_random_words') {
      sendRandomWords(bot, 15, words);
    } else if (action === '10_user_words') {
      const user = getUser(collection, opts.chat_id);
      sendRandomWords(bot, 10, user.words);
    } else if (action === '15_user_words') {
      const user = getUser(collection, opts.chat_id);
      sendRandomWords(bot, 15, user.words);
    } else if (action.startsWith('context_')) {
      const word_id = +action.replace('context_', '');
      getContext(bot, words[word_id][1]);
    } else if (action.startsWith('synonym_')) {
      const word_id = +action.replace('synonym_', '');
      getSynonyms(bot, words[word_id][1]);
    } else if (action.startsWith('memorize_')) {
      const word_id = +action.replace('memorize_', '');
      addWordToMemorize(collection, opts.chat_id, words[word_id]).then(() => {
        bot.sendMessage(opts.chat_id, `Слово *${words[word_id][1]}* було додано до списку вивчаємих`, {parse_mode: 'markdown'});
      });
    } else if (action.startsWith('frequency_')) {
      const interval = +action.replace('frequency_', '');
      setTimeInterval(collection, opts.chat_id, interval).then(() => {
        bot.sendMessage(opts.chat_id, `Інтервал між словами *${interval}* хвилин`, {parse_mode: 'markdown'});
      });
    }
  });
  
  bot.on("polling_error", console.log);

  const allUsers = getAllUsers(collection);

  allUsers.map(user => {
    sendRandomWord(bot, words, user);
  });
});
