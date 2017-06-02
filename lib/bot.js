const loans = require('./loans');

const MIN_AMOUNT = 0.01;

function start() {
  loans.available().then(balances => {
    for (const currency in balances.lending) {
      const available = Number.parseFloat(balances.lending[currency]);
      console.log(`${currency}: ${available}`);
      if (available > MIN_AMOUNT) {
        console.log('yes', available);
      }
    }
  }).catch(err => console.error(error));
}

module.exports = { start };
