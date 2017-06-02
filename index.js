require('dotenv').config();
const loans = require('./lib/loans');

loans.balance().then(a => console.log(a));

