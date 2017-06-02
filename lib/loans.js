/**
 * Poloniex loans API
 */

const crypto = require('crypto');
const request = require('request');
const querystring = require('querystring');

const TRADING_API_URI = 'https://poloniex.com/tradingApi';

/**
 * Sign request and post
 */
function _post(params) {
  if (!params.nonce) {
    params.nonce = new Date().getTime() * 29;
  }

  const paramString = querystring.stringify(params);
  const signature = crypto.createHmac('sha512', process.env.POLO_SECRET).update(paramString).digest('hex');

  const options = {
    method: 'POST',
    url: TRADING_API_URI,
    headers: {
      Key: process.env.POLO_KEY,
      Sign: signature,
    },
    form: params,
  };

  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) {
        return reject(body);
      }
      return resolve(body);
    });
  });
}

function create(rate, amount, days, currency = 'BTC', autoRenew = 0) {
  const params = {
    command: 'createLoanOffer',
    currency,
    amount,
    duration: days,
    autoRenew,
    lendingRate: rate,
  };
  return _post(params);
}

function cancel(id) {
  const params = {
    command: 'cancelLoanOffer',
    orderNumder: id,
  };
  return _post(params);
}

function balance() {
  const params = {
    command: 'returnAvailableAccountBalances',
    account: 'lending',
  };
  return _post(params);
}

module.exports = { create, cancel, balance }


