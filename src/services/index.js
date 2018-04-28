const donations = require('./donations/donations.service.js');
const deposits = require('./deposits/deposits.service.js');
const payments = require('./payments/payments.service.js');
const withdrawals = require('./withdrawals/withdrawals.service.js');
const range = require('./range/range.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(donations);
  app.configure(deposits);
  app.configure(payments);
  app.configure(withdrawals);
  app.configure(range);
};
