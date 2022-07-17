const Reverso = require('reverso-api');
const reverso = new Reverso();

module.exports = function getSynonyms(bot, word) {
  reverso.getSynonyms(word, 'english', (err, response) => {
    if (err) throw new Error(err.message);

    let synonyms = response.synonyms.map(s => s.synonym).join(', ');
    bot.sendMessage(process.env.CHAT_ID, synonyms);
  });
}