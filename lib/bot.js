const loans = require('./loans');

const MIN_AMOUNT = 0.01;
const DURATION_DAYS = 3; // Bot will try to optimize rate for the days of loan offered
const MAX_CUMULATIVE = 1;
const RATE_GRANULARITY = 0.000001;

function _getOptimalRate(currency, available = 0.1) {
  return loans.allOrders(currency).then((orders) => {
    const offers = orders.offers;
    let cumulative = 0;
    let rate = 0.001;

    let i = 0;
    offers.some((offer) => {
      if (offer.rangeMax >= DURATION_DAYS) {
        cumulative = cumulative + Number.parseFloat(offer.amount);
        rate = Number.parseFloat(offer.rate);
        return (cumulative >= available || cumulative >= MAX_CUMULATIVE);
      }
      return false;
    });

    return (rate - RATE_GRANULARITY).toPrecision(6);
  });
}

/**
 * Cancel all open offers and re-optimize
 */
function _checkAndCancelOpenOffers() {
  const cancelTasks = [];

  return loans.myOpenOffers().then((response) => {
    for (const currency in response) {
      const offers = response[currency];

      console.log(`${offers.length} open loan offers for ${currency}`);
      offers.forEach((offer) => {
        cancelTasks.push(loans.cancel(offer.id));
      });
    }

    if (cancelTasks.length > 0) {
      console.log(`Cancelling ${cancelTasks.length} loan offers.`);
      return Promise.all(cancelTasks).then(a => console.log(a));
    } else {
      console.log('No open loan offers.');
      return true;
    }
  });
}

function start() {
  return _checkAndCancelOpenOffers().then(() => {
    return loans.available().then(balances => {
      const offerPromises = [];

      for (const currency in balances.lending) {
        const available = Number.parseFloat(balances.lending[currency]);
        console.log(`${currency}: ${available}`);

        if (available > MIN_AMOUNT) {
          offerPromises.push(_getOptimalRate(currency, available).then((rate) => {
            console.log(`Optimal rate for ${currency} ${available} for ${DURATION_DAYS} days: ${(rate * 100).toPrecision(6)}% (${(rate * 100 * 365).toPrecision(4)}% p.a.)`);
            return loans.create(rate, available, DURATION_DAYS, currency);
          }).then(creation => console.log(creation)));
        } else {
          console.log('Less than minimum loan offer amount.');
        }
      }
      return Promise.all(offerPromises);
    });
  }).catch(err => console.error(error));
}

module.exports = { start };
