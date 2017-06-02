// require('dotenv').config();
const bot = require('./lib/bot');

function start(event, context) {
  return bot.start().then(() => context.done(null)).catch(err => context.fail(err));
}

module.exports = { start };
