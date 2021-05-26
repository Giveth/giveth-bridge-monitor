const logger = require('winston');
const app = require('../app');
const { getHomeContract } = require('./web3Provider');

const handleHomeEvent = async _event => {
  const { event, returnValues } = _event;
  logger.info(`Processing event: ${JSON.stringify({ event, returnValues }, null, 2)}`);
  switch (event) {
    case 'Donate':
      await app.service('donations').create({
        event: _event,
        giverCreation: false,
        matched: false,
        matches: [],
        hasDuplicates: false,
        eventId: event.id,
      });
      break;

    case 'DonateAndCreateGiver':
      await app.service('donations').create({
        event: _event,
        giverCreation: true,
        matched: false,
        matches: [],
        hasDuplicates: false,
        eventId: event.id,
      });
      break;

    case 'PaymentAuthorized':
      {
        const homeContract = getHomeContract();
        const payment = await homeContract.methods
          .authorizedPayments(_event.returnValues.idPayment)
          .call();
        await app.service('payments').create({
          event: _event,
          matched: false,
          paid: payment.paid,
          canceled: payment.canceled,
          matches: [],
          earliestPayTime: Number(payment.earliestPayTime) * 1000,
          securityGuardDelay: Number(payment.securityGuardDelay),
          hasDuplicates: false,
          eventId: _event.id,
        });
      }
      break;

    case 'PaymentExecuted':
      await app.service('payments').patch(
        null,
        {
          paymentTransactionHash: _event.transactionHash,
        },
        {
          query: {
            'event.returnValues.idPayment': _event.returnValues.idPayment,
          },
        },
      );
      break;

    case 'SpenderAuthorization':
      {
        const isAuthorized = _event.returnValues.authorized;
        const address = _event.returnValues.spender;

        if (!address || address === 'undefined') {
          return false;
        }

        // See if the spender as previously been authorized
        const previousRecord = await app.service('spenders').find({
          query: {
            'event.returnValues.spender': address,
          },
        });

        if (isAuthorized && previousRecord.total === 0) {
          await app.service('spenders').create({
            event: _event,
          });
        }

        if (!isAuthorized && previousRecord.total !== 0) {
          await app.service('spenders').remove(previousRecord.data[0]._id);
        }
      }
      break;

    default:
      logger.info(`Ignored unsupported event ${event}`);
  }

  const homeContract = await getHomeContract();
  // update payment status
  await app
    .service('payments')
    .find({ paginate: false, query: { $and: [{ paid: false }, { canceled: false }] } })
    .then(payments =>
      payments.map(payment =>
        homeContract.methods
          .authorizedPayments(payment.event.returnValues.idPayment)
          .call()
          .then(p => {
            return app.service('payments').patch(payment._id, {
              paid: p.paid,
              canceled: p.canceled,
              earliestPayTime: Number(p.earliestPayTime) * 1000,
              securityGuardDelay: Number(p.securityGuardDelay),
            });
          }),
      ),
    )
    .then(promises => Promise.all(promises));
};
const handleForeignEvent = async _event => {
  const { event, returnValues } = _event;
  logger.info(`Processing event: ${JSON.stringify({ event, returnValues }, null, 2)}`);
  switch (event) {
    case 'Deposit':
      await app.service('deposits').create({
        event: _event,
        matched: false,
        matches: [],
        hasDuplicates: false,
        eventId: _event.id,
      });
      break;

    case 'Withdraw':
      await app.service('withdrawals').create({
        event: _event,
        matched: false,
        matches: [],
        hasDuplicates: false,
        eventId: _event.id,
      });
      break;

    default:
      logger.info(`Ignored unsupported event ${event}`);
  }
};

const handleEvent = async event => {
  const { isHomeEvent } = event;
  return isHomeEvent ? handleHomeEvent(event) : handleForeignEvent(event);
};
module.exports = handleEvent;
