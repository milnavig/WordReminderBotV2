function createUser(collection, chatId) {
  const user = collection.where({chatId: Number(chatId)}).items[0];
  const default_interval = 60;
  if (!user) {
    collection.insert([
      {chatId, words: [], interval: default_interval},
    ]);
  }
}

function addWordToMemorize(collection, chatId, word) {
  const user = collection.where({chatId: Number(chatId)}).items[0];
  if (!user) {
    collection.insert([
      {chatId, words: [word], interval: 60},
    ]);
    return Promise.resolve();
  }
  if (!user.words.map(words => words[1]).includes(word[1])) {
    collection.update(user.cid, {words: [...user.words, word]});
  }
  return Promise.resolve();
}

function setTimeInterval(collection, chatId, interval) {
  const user = collection.where({chatId: Number(chatId)}).items[0];
  if (!user) {
    collection.insert([
      {chatId, words: [], interval},
    ]);
    return Promise.resolve();
  }
  collection.update(user.cid, {interval});
  return Promise.resolve();
}

function getTimeInterval(collection, chatId) {
  const user = collection.where({chatId: Number(chatId)}).items[0];
  const default_interval = 60;
  if (!user) {
    collection.insert([
      {chatId, words: [], interval: default_interval},
    ]);
    return Promise.resolve(default_interval);
  }
  return Promise.resolve(user.interval || default_interval);
}

function getAllUsers(collection) {
  return collection.items;
}

function getUser(collection, chatId) {
  return collection.where({chatId: Number(chatId)}).items[0];
}

module.exports = {
  createUser,
  getUser,
  addWordToMemorize,
  setTimeInterval,
  getTimeInterval,
  getAllUsers,
}