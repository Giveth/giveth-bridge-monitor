const app = require('../app');
const Web3 = require('web3');
const asyncForEach = require('./helpers/asyncForEach');

const HomeBridgeContract = require('giveth-bridge/build/GivethBridge.json');
const HomeBridgeABI = HomeBridgeContract.compilerOutput.abi;
const ForeignBridgeContract = require('giveth-bridge/build/ForeignGivethBridge.json');
const ForeignBridgeABI = ForeignBridgeContract.compilerOutput.abi;

const populate = async () => {
  const homeNodeURL = app.get('homeNodeURL');
  const foreignNodeURL = app.get('foreignNodeURL');

  console.log('Creating Web3 objects...');
  let homeWeb3, foreignWeb3;
  try {
    homeWeb3 = new Web3(homeNodeURL);
    foreignWeb3 = new Web3(foreignNodeURL);
  } catch (error) {
    console.log(error);
    return true;
  }
  console.log('Success!');

  const homeContractAddress = app.get('homeContractAddress');
  const foreignContractAddress = app.get('foreignContractAddress');

  console.log('Creating contract instances...');
  const homeContract = new homeWeb3.eth.Contract(HomeBridgeABI, homeContractAddress);
  const foreignContract = new foreignWeb3.eth.Contract(ForeignBridgeABI, foreignContractAddress);
  console.log('Success!');

  console.log('Getting current home block number...');
  let currentHomeBlock;
  try {
    currentHomeBlock = await homeWeb3.eth.getBlockNumber();
  } catch (error) {
    console.log(error);
    return true;
  }
  console.log('Success!');

  console.log('Getting current foreign block number...');
  let currentForeignBlock;
  try {
    currentForeignBlock = await foreignWeb3.eth.getBlockNumber();
  } catch (error) {
    console.log(error);
    return true;
  }
  console.log('Success!');

  console.log('Retrieving any stored block range...');
  const range = await app.service('range').get(1);
  console.log('Success!');

  const securityGuardLastCheckin =
    (await homeContract.methods.securityGuardLastCheckin().call()) * 1000;
  app.set('securityGuardLastCheckin', securityGuardLastCheckin);

  // Either no new home or foreign blocks, or an incorrect current block number was given
  if (currentHomeBlock < range.home || currentForeignBlock < range.foreign) {
    console.log(
      'Either no new home or foreign blocks, or retrieved current block number looks fishy...',
    );
    console.log('Exiting.');
    return true;
  }
  const homeRange = {
    fromBlock: range.home,
    toBlock: Math.min(currentHomeBlock, range.home + 500000),
  };

  const foreignRange = {
    fromBlock: range.foreign,
    toBlock: Math.min(currentForeignBlock, range.foreign + 500000),
  };

  console.log('Getting past events...');
  let eventPromises;
  try {
    eventPromises = [
      homeContract.getPastEvents('allEvents', homeRange),
      foreignContract.getPastEvents('allEvents', foreignRange),
    ];
  } catch (error) {
    console.log(error);
    return true;
  }

  let homeEvents, foreignEvents;
  try {
    [homeEvents, foreignEvents] = await Promise.all(eventPromises);
  } catch (error) {
    console.log(error);
    return true;
  }
  console.log('Success!');

  console.log('Getting foreign depositor...');
  let depositor;
  try {
    depositor = await foreignContract.methods.depositor().call();
  } catch (error) {
    console.log(error);
    return true;
  }
  console.log('Success!');

  console.log('Blockchain interaction finished, creating records...');

  let donationEvents = homeEvents.filter(homeEvent => homeEvent.event == 'Donate');
  let donationAndCreationEvents = homeEvents.filter(
    homeEvent => homeEvent.event == 'DonateAndCreateGiver',
  );
  let depositEvents = foreignEvents.filter(foreignEvent => foreignEvent.event == 'Deposit');
  let withdrawalEvents = foreignEvents.filter(foreignEvent => foreignEvent.event == 'Withdraw');
  let paymentAuthorizedEvents = homeEvents.filter(homeEvent => homeEvent.event == 'PaymentAuthorized');
  let paymentExecutedEvents = homeEvents.filter(homeEvent => homeEvent.event == 'PaymentExecuted');

  let spenderEvents = homeEvents.filter(homeEvent => homeEvent.event == 'SpenderAuthorization');
  let spenderAuths = spenderEvents.filter(event => event.returnValues.authorized);
  let spenderDeauths = spenderEvents.filter(event => !event.returnValues.authorized);

  await asyncForEach(donationEvents, async donation => {
    await app.service('donations').create({
      event: donation,
      giverCreation: false,
      matched: false,
      matches: [],
      hasDuplicates: false,
      _id: donation.id,
    });
  });

  await asyncForEach(donationAndCreationEvents, async donation => {
    await app.service('donations').create({
      event: donation,
      giverCreation: true,
      matched: false,
      matches: [],
      hasDuplicates: false,
      _id: donation.id,
    });
  });

  await asyncForEach(depositEvents, async deposit => {
    await app.service('deposits').create({
      event: deposit,
      matched: false,
      matches: [],
      hasDuplicates: false,
      _id: deposit.id,
    });
  });

  await asyncForEach(withdrawalEvents, async withdrawal => {
    await app.service('withdrawals').create({
      event: withdrawal,
      matched: false,
      matches: [],
      hasDuplicates: false,
      _id: withdrawal.id,
    });
  });

  await asyncForEach(paymentAuthorizedEvents, async paymentAuthorized => {
    await homeContract.methods
      .authorizedPayments(paymentAuthorized.returnValues.idPayment)
      .call()
      .then(p =>
        app.service('payments').create({
          event: paymentAuthorized,
          matched: false,
          paid: p.paid,
          canceled: p.canceled,
          matches: [],
          earliestPayTime: Number(p.earliestPayTime) * 1000,
          securityGuardDelay: Number(p.securityGuardDelay),
          hasDuplicates: false,
          _id: paymentAuthorized.id,
        }),
      );
  });

  await asyncForEach(paymentExecutedEvents, async paymentExecuted => {
    await app.service('payments').patch(null, {
      paymentTransactionHash: paymentExecuted.transactionHash,
    }, {
      query: {
        "event.returnValues.idPayment": paymentExecuted.returnValues.idPayment,
      }
    })
  })

  // make sure spenderEvents are in order by block
  spenderEvents.sort((a, b) => {
    return a.blockNumber - b.blockNumber;
  });

  await asyncForEach(spenderEvents, async spender => {
    const isAuthorized = spender.returnValues.authorized;
    const address = spender.returnValues.spender;

    if (!address || address === undefined || address == 'undefined') {
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
        event: spender,
      });
    }

    if (!isAuthorized && previousRecord.total != 0) {
      await app.service('spenders').remove(previousRecord.data[0]._id);
    }
  });

  app.set('depositor', depositor);

  const patched = await app.service('range').patch(1, {
    home: homeRange.toBlock + 1,
    foreign: foreignRange.toBlock + 1,
  });

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

  console.log('Success!');

  if (currentForeignBlock > foreignRange.toBlock || currentHomeBlock > homeRange.toBlock) {
    return await populate();
  }
  return true;
};

module.exports = populate;
