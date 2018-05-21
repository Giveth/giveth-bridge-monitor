const app = require('../app');
const Web3 = require('web3');
const asyncForEach = require('./helpers/asyncForEach');

const HomeBridgeContract = require('giveth-bridge/build/contracts/GivethBridge.sol.js');
const HomeBridgeABI = HomeBridgeContract.GivethBridgeAbi;
const ForeignBridgeContract = require('giveth-bridge/build/contracts/ForeignGivethBridge.sol.js');
const ForeignBridgeABI = ForeignBridgeContract.ForeignGivethBridgeAbi;

module.exports = async () => {

  const homeNodeURL = app.get('homeNodeURL');
  const foreignNodeURL = app.get('foreignNodeURL');

  console.log('Creating Web3 objects...');
  const homeWeb3 = new Web3(homeNodeURL);
  const foreignWeb3 = new Web3(foreignNodeURL);
  console.log('Success!');

  const homeContractAddress = app.get('homeContractAddress');
  const foreignContractAddress = app.get('foreignContractAddress');

  console.log('Creating contract instances...');
  const homeContract = new homeWeb3.eth.Contract(HomeBridgeABI, homeContractAddress);
  const foreignContract = new foreignWeb3.eth.Contract(ForeignBridgeABI, foreignContractAddress);
  console.log('Success!');

  console.log('Retrieving any stored block range...');
  const range = await app.service('range').find({
    query: {
      _id: 1
    }
  });
  console.log('Success!');

  console.log('Getting current home block number...');
  let currentHomeBlock;
  try {
    currentHomeBlock = await homeWeb3.eth.getBlockNumber();
  } catch (error){
    console.log('Funky error getting home block number from infura:');
    console.log(error);
    return true;
  }
  console.log('Success!');

  console.log('Getting current foreign block number...');
  const currentForeignBlock = await foreignWeb3.eth.getBlockNumber();
  console.log('Success!');

  let searchRange;
  let updateRange;
  switch (range.total){
    case 0: {
      console.log('No saved block range found');
      console.log('Begining from configured start blocks to current blocks');
      searchRange = {
        home: {
          fromBlock: app.get('homeStartBlock'),
          toBlock: currentHomeBlock,
        },
        foreign: {
          fromBlock: app.get('foreignStartBlock'),
          toBlock: currentForeignBlock,
        }
      }
      updateRange = app.service('range').create({
        home: currentHomeBlock,
        foreign: currentForeignBlock,
        _id: 1
      });
      break;
    }
    case 1: {
      const lastHomeBlockSearched = range.data[0].home;
      const lastForeignBlockSearched = range.data[0].foreign;
      let nextHomeStartBlock, nextForeignStartBlock;

      // Prevent searching from a starting block past the current toBlock
      // though web3 doesn't seem to mind
      if (
        lastHomeBlockSearched === currentHomeBlock &&
        lastForeignBlockSearched === currentForeignBlock
      ) {
        console.log('No new blocks since last poll, stopping')
        return true;
      }

      if (lastHomeBlockSearched === currentHomeBlock) {
        nextHomeStartBlock = currentHomeBlock;
      } else {nextHomeStartBlock = lastHomeBlockSearched + 1}

      if (lastForeignBlockSearched === currentForeignBlock) {
        nextForeignStartBlock = currentForeignBlock;
      } else {nextForeignStartBlock = lastForeignBlockSearched + 1}

      console.log('Resuming from home block', nextHomeStartBlock, 'and foreign block', nextForeignStartBlock);
      searchRange = {
        home: {
          fromBlock: nextHomeStartBlock,
          toBlock: currentHomeBlock,
        },
        foreign: {
          fromBlock: nextForeignStartBlock,
          toBlock: currentForeignBlock,
        }
      }

      updateRange = app.service('range').update(1, {
        home: currentHomeBlock,
        foreign: currentForeignBlock
      });

      break;
    }

    case 2: {
      console.log('Multiple block ranges found! This is bad and should never happen');
      break;
    }

    default: break;

    }

    console.log('Getting past events...');
    let eventPromises = [
      homeContract.getPastEvents('allEvents', searchRange.home),
      foreignContract.getPastEvents('allEvents', searchRange.foreign)
    ];

    let homeEvents, foreignEvents;

    [homeEvents, foreignEvents] = await Promise.all(eventPromises);
    console.log('Success!');

    let donationEvents = homeEvents.filter(homeEvent => homeEvent.event == 'Donate');
    let donationAndCreationEvents = homeEvents.filter(homeEvent => homeEvent.event == 'DonateAndCreateGiver');
    let depositEvents = foreignEvents.filter(foreignEvent => foreignEvent.event == 'Deposit');
    let withdrawalEvents = foreignEvents.filter(foreignEvent => foreignEvent.event == 'Withdraw');
    let paymentEvents = homeEvents.filter(homeEvent => homeEvent.event == 'PaymentAuthorized');

    let spenderEvents = homeEvents.filter(homeEvent => homeEvent.event == 'SpenderAuthorization');
    let spenderAuths = spenderEvents.filter(event => event.returnValues.authorized);
    let spenderDeauths = spenderEvents.filter(event => !event.returnValues.authorized);

    await asyncForEach(depositEvents, async (deposit) => {
      await app.service('deposits').create({
        event: deposit,
        matched: false,
        matches: [],
        hasDuplicates: false,
        _id: deposit.transactionHash,
      });
    });

    await asyncForEach(donationEvents, async (donation) => {
      await app.service('donations').create({
        event: donation,
        giverCreation: false,
        matched: false,
        matches: [],
        hasDuplicates: false,
        _id: donation.transactionHash,
      })
    });

    await asyncForEach(donationAndCreationEvents, async (donation) => {
      await app.service('donations').create({
        event: donation,
        giverCreation: true,
        matched: false,
        matches: [],
        hasDuplicates: false,
        _id: donation.transactionHash,
      })
    });

    await asyncForEach(withdrawalEvents, async (withdrawal) => {
      await app.service('withdrawals').create({
        event: withdrawal,
        matched: false,
        matches: [],
        hasDuplicates: false,
        _id: withdrawal.transactionHash,
      });
    });


    await asyncForEach(paymentEvents, async (payment) => {
      await app.service('payments').create({
        event: payment,
        matched: false,
        matches: [],
        hasDuplicates: false,
        _id: payment.transactionHash,
      });
    });

    // make sure spenderEvents are in order by block
    spenderEvents.sort((a, b) => {
      return (a.blockNumber - b.blockNumber);
    });

    await asyncForEach(spenderEvents, async (spender) => {
      const isAuthorized = spender.returnValues.authorized;
      const address = spender.returnValues.spender;

      // See if the spender as previously been authorized
      const previousRecord = await app.service('spenders').find({
        query: {
          'event.returnValues.spender': address,
        }
      });
      console.log(previousRecord);
      if (isAuthorized && previousRecord.total === 0) {
        //console.log('Creating record for new spender authorized');
        await app.service('spenders').create({
          event: spender,
          _id: spender.transactionHash,
        });
      }

      if (!isAuthorized && previousRecord.total != 0 ){
        await app.service('spenders').remove(previousRecord.data[0]._id);
      }

    });

    const owner = await foreignContract.methods.owner().call();
    const previousOwner = await app.service('owners').find({
      query: {
        _id: 1,
      }
    });

    if (previousOwner.total === 1 && previousOwner.data[0].address != owner){
      await app.service('owners').patch(1, {
        address: owner,
      });
    }

    else if (previousOwner.total === 0){
      await app.service('owners').create({
        _id: 1,
        address: owner,
      });
    }
    await Promise.resolve(updateRange);

    return true;
}
