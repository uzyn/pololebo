const loans = require('./loans');

const MIN_AMOUNT = 0.01;
const DURATION_DAYS = 3; // Bot will try to optimize rate for the days of loan offered
const MAX_CUMULATIVE = 1;
const RATE_GRANULARITY = 0.000001;

function _getOptimalRate(currency) {
  return loans.allOrders(currency).then((orders) => {
    const offers = orders.offers;
    let cumulative = 0;
    let rate = 0.001;
    let available = 0.4; // TOREMOVE

    let i = 0;
    offers.some((offer) => {
      if (offer.rangeMax >= DURATION_DAYS) {
        cumulative = cumulative + Number.parseFloat(offer.amount);
        rate = Number.parseFloat(offer.rate);
        return (cumulative >= available || cumulative >= MAX_CUMULATIVE);
      }
      return false;
    });

    return Math.floor((rate - RATE_GRANULARITY) / RATE_GRANULARITY) * RATE_GRANULARITY;
  });
}

function start() {
  _getOptimalRate('BTC').then(rate => console.log(rate));
  // loans.available().then(balances => {
  //   for (const currency in balances.lending) {
  //     const available = Number.parseFloat(balances.lending[currency]);
  //     console.log(`${currency}: ${available}`);
  //     if (available > MIN_AMOUNT) {
  //       console.log('yes', available);
  //     }
  //   }
  // }).catch(err => console.error(error));
}

module.exports = { start };
