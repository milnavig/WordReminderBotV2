const Reverso = require('reverso-api');
const reverso = new Reverso();

module.exports = async function getContext(bot, word) {
  reverso.getContext(
    word,
    'english',
    'russian',
    (err, response) => {
      if (err) throw new Error(err.message);

      let examples = response.examples.slice(0, 5).map(data => `${data.id + 1}. ${data.source} \n ${data.target}`).join('\n\n');
      bot.sendMessage(process.env.CHAT_ID, examples);
    }
)
}