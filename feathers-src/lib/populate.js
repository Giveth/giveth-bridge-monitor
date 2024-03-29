const logger = require('winston');
const errors = require('@feathersjs/errors');
const app = require('../app');
const handleEvent = require('./eventHandler');
const {
  getHomeWeb3,
  getForeignWeb3,
  getHomeContract,
  getForeignContract,
} = require('./web3Provider');
const { EventStatus } = require('../models/events.model');

const getLastBlock = async (isHome = false) => {
  const opts = {
    paginate: false,
    query: {
      isHomeEvent: isHome,
      $limit: 1,
      $sort: {
        blockNumber: -1,
      },
    },
  };

  let events;
  try {
    events = await app.service('events').find(opts);
  } catch (err) {
    logger.error('Error fetching events', err);
  }

  if (events && events.length > 0) return events[0].blockNumber;

  // default to blockchain.startingBlock in config
  return isHome ? app.get('homeStartBlock') : app.get('foreignStartBlock');
};

const processNextWaitingEvent = async () => {
  const query = {
    status: EventStatus.WAITING,
    $sort: {
      // maybe we get some events from home and blockchain with different blockNumber, so the transactionTime
      // should be the first important thing for decide what event should process first
      timestamp: 1,
      blockNumber: 1,
      transactionIndex: 1,
      logIndex: 1,
    },
    $limit: 1,
  };

  const service = app.service('events');
  const [event] = await service.find({
    query,
    paginate: false,
  });

  if (!event) return false;

  await service.patch(event._id, {
    status: EventStatus.PROCESSING,
  });
  try {
    await handleEvent(event);

    await service.patch(event._id, {
      status: EventStatus.PROCESSED,
    });
  } catch (err) {
    logger.error('Error on processing event ', event._id);

    await service.patch(event._id, {
      status: EventStatus.FAILED,
    });
  }

  return true;
};

let lastForeignBlock = 0;
let lastHomeBlock = 0;

function setLastForeignBlock(blockNumber) {
  if (blockNumber > lastForeignBlock) lastForeignBlock = blockNumber;
}
function setLastHomeBlock(blockNumber) {
  if (blockNumber > lastHomeBlock) lastHomeBlock = blockNumber;
}

async function fetchHomeEvents(homeRange) {
  const homeContract = getHomeContract();
  let events = [];
  if (homeRange.fromBlock < homeRange.toBlock) {
    logger.info(`Fetch home events fromBlock ${homeRange.fromBlock} toBlock ${homeRange.toBlock}`);
    try {
      events = await homeContract.getPastEvents('allEvents', homeRange);
    } catch (e) {
      logger.error('Error in fetching home past events', e);
    }
  }
  return events;
}

async function fetchForeignEvents(foreignRange) {
  const foreignContract = getForeignContract();
  let events = [];
  if (foreignRange.fromBlock < foreignRange.toBlock) {
    logger.info(
      `Fetch foreign events fromBlock ${foreignRange.fromBlock} toBlock ${foreignRange.toBlock}`,
    );
    try {
      events = await foreignContract.getPastEvents('allEvents', foreignRange);
    } catch (e) {
      logger.error('Error in fetching foreign past events', e);
    }
  }
  return events;
}

/**
 * fetches the transaction for the given hash in foreign network.
 *
 * first checks if the transaction has been saved in db
 * if it misses, we fetch the block using web3 and save it in db
 *
 * if we are currently fetching a given hash, we will not fetch it twice.
 * instead, we resolve the promise after we fetch the transaction for the hash.
 *
 * @param {string} hash the hash to fetch the transaction of
 * @param {boolean} isHome get transaction of home network
 */
const getTransaction = async (hash, isHome = false) => {
  if (!hash) {
    throw new errors.NotFound(`Hash value cannot be undefined`);
  }
  const Transaction = app.get('transactionsModel');
  const query = { hash, isHome };
  const result = await Transaction.findOne(query);
  if (result) {
    return result;
  }

  const web3 = isHome ? getHomeWeb3() : getForeignWeb3();
  const tx = await web3.eth.getTransaction(hash);
  if (!tx) {
    // sometimes tx is not null but the tx.blockNumber is null (maybe when transaction is not mined already)
    throw new errors.NotFound(`Not tx found for ${hash}`);
  }
  const { from, blockNumber } = tx;

  const model = {
    hash,
    from,
    isHome: !!isHome,
  };

  // Transaction is mined
  if (blockNumber) {
    model.blockNumber = blockNumber;

    const { timestamp } = await web3.eth.getBlock(blockNumber);
    model.timestamp = new Date(timestamp * 1000);
    const transaction = new Transaction(model);
    await transaction.save();
  }
  return model;
};

const createEvent = async (event, isHomeEvent) => {
  const { timestamp } = await getTransaction(event.transactionHash, isHomeEvent);
  await app
    .service('events')
    .create({ isHomeEvent, timestamp, ...event })
    .catch(err => logger.error(JSON.stringify(event, null, 2), err));
};

const populate = async () => {
  logger.debug('Fetch initial block numbers');
  setLastForeignBlock((await getLastBlock()) + 1);
  setLastHomeBlock((await getLastBlock(true)) + 1);

  logger.debug('Creating Web3 objects...');
  let homeWeb3;
  let foreignWeb3;
  try {
    homeWeb3 = getHomeWeb3();
    foreignWeb3 = getForeignWeb3();
  } catch (error) {
    logger.error('error on geting web3:', error);
    return true;
  }
  logger.debug('Success!');

  logger.debug('Creating contract instances...');
  const homeContract = getHomeContract();
  const foreignContract = getForeignContract();
  logger.debug('Success!');

  logger.debug('Getting current home block number...');
  let currentHomeBlock;
  try {
    currentHomeBlock = await homeWeb3.eth.getBlockNumber();
  } catch (error) {
    logger.error('error in getting last home block number:', error);
    return true;
  }
  logger.debug('Success!');

  logger.debug('Getting current foreign block number...');
  let currentForeignBlock;
  try {
    currentForeignBlock = await foreignWeb3.eth.getBlockNumber();
  } catch (error) {
    logger.error('error in getting last foreign block number:', error);
    return true;
  }
  logger.debug('Success!');

  const securityGuardLastCheckin =
    (await homeContract.methods.securityGuardLastCheckin().call()) * 1000;
  app.set('securityGuardLastCheckin', securityGuardLastCheckin);

  const homeRange = {
    fromBlock: lastHomeBlock,
    toBlock: Math.min(currentHomeBlock, lastHomeBlock + 500000),
  };

  const foreignRange = {
    fromBlock: lastForeignBlock,
    toBlock: Math.min(currentForeignBlock, lastForeignBlock + 500000),
  };

  logger.debug('Getting past events...');
  let eventPromises;
  try {
    eventPromises = [fetchHomeEvents(homeRange), fetchForeignEvents(foreignRange)];
  } catch (error) {
    logger.error(error);
    return true;
  }

  let homeEvents;
  let foreignEvents;
  try {
    [homeEvents, foreignEvents] = await Promise.all(eventPromises);
  } catch (error) {
    logger.error(error);
    return true;
  }
  logger.debug('Success!');

  logger.debug('Getting foreign depositor...');
  let depositor;
  try {
    depositor = await foreignContract.methods.depositor().call();
  } catch (error) {
    logger.error('error in getting depositor:', error);
    return true;
  }
  logger.debug('Success!');

  logger.debug('Blockchain interaction finished, creating records...');

  try {
    await Promise.all(homeEvents.map(event => createEvent(event, true)));
  } catch (err) {
    logger.error('error in creating home events:', err);
  }
  try {
    await Promise.all(foreignEvents.map(event => createEvent(event, false)));
  } catch (err) {
    logger.error('error in creating foreign events:', err);
  }

  app.set('depositor', depositor);

  // Always fetch from last event
  // setLastHomeBlock(homeRange.toBlock + 1);
  // setLastForeignBlock(foreignRange.toBlock + 1);

  // eslint-disable-next-line no-await-in-loop
  while (await processNextWaitingEvent()) {
    // Empty
  }

  logger.debug('Success!');

  if (currentForeignBlock > foreignRange.toBlock || currentHomeBlock > homeRange.toBlock) {
    logger.info('Re-fetching');
    return populate();
  }
  return true;
};

module.exports = populate;
