const donations = require('./donations/donations.service');
const deposits = require('./deposits/deposits.service');
const payments = require('./payments/payments.service');
const withdrawals = require('./withdrawals/withdrawals.service');
const spenders = require('./spenders/spenders.service');
const depositors = require('./depositors/depositors.service');
const information = require('./information/information.service');
const events = require('./events/events.service');

// eslint-disable-next-line no-unused-vars
module.exports = app => {
  app.configure(donations);
  app.configure(deposits);
  app.configure(payments);
  app.configure(withdrawals);
  app.configure(spenders);
  app.configure(depositors);
  app.configure(information);
  app.configure(events);
};
