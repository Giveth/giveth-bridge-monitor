const app = require('../app');
const Web3 = require('web3');
const HomeBridgeContract = require('giveth-bridge/build/contracts/GivethBridge.sol.js');
const HomeBridgeABI = HomeBridgeContract.GivethBridgeAbi;
const ForeignBridgeContract = require('giveth-bridge/build/contracts/ForeignGivethBridge.sol.js');
const ForeignBridgeABI = ForeignBridgeContract.ForeignGivethBridgeAbi;

module.exports = async () => {

  const homeNodeURL = app.get('homeNodeURL');
  const foreignNodeURL = app.get('foreignNodeURL');

  const homeWeb3 = new Web3(homeNodeURL);
  const foreignWeb3 = new Web3(foreignNodeURL);

  const homeContractAddress = app.get('homeContractAddress');
  const foreignContractAddress = app.get('foreignContractAddress');

  const homeContract = new homeWeb3.eth.Contract(HomeBridgeABI, homeContractAddress);
  const foreignContract = new foreignWeb3.eth.Contract(ForeignBridgeABI, foreignContractAddress);

  // const homeWeb3 = new Web3('https://ropsten.infura.io/HDYgcFmpY0f2PqcsSiPB');
  // const foreignWeb3 = new Web3('https://rinkeby.infura.io/HDYgcFmpY0f2PqcsSiPB');
  //
  // const homeContract = new homeWeb3.eth.Contract(HomeBridgeABI, '0x0cB06B291c40c76d7bEe7C9f1fAa4D6A4b338C49');
  // const foreignContract = new foreignWeb3.eth.Contract(ForeignBridgeABI, '0x97bd4e1b4f647ab5f0a8248dd9c7218ce044ced9');

  const rangeService = await app.service('range');
  const range = await rangeService.find({
    query: {
      _id: 1,
    }
  });
  const currentHomeBlock = await homeWeb3.eth.getBlockNumber();
  const currentForeignBlock = await foreignWeb3.eth.getBlockNumber();

  let searchRange;
  let updateRange;
  switch (range.total){
    case 0: {
      //console.log('No saved block range found, starting search from first block to home block number', currentHomeBlock, 'and foreign block number', currentForeignBlock);
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
      //console.log('Resuming search from home block number', lastHomeBlockSearched);
      searchRange = {
        home: {
          fromBlock: lastHomeBlockSearched + 1,
          toBlock: currentHomeBlock,
        },
        foreign: {
          fromBlock: lastForeignBlockSearched + 1,
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
      // more than one saved range, this is bad and shouldn't happen, but need to handle this case.
      break;
    }

    default: break;

    }

    let eventPromises = [
      homeContract.getPastEvents('Donate', searchRange.home),
      homeContract.getPastEvents('DonateAndCreateGiver', searchRange.home),
      foreignContract.getPastEvents('Deposit', searchRange.foreign),
      foreignContract.getPastEvents('Withdraw', searchRange.foreign),
      homeContract.getPastEvents('PaymentAuthorized', searchRange.home)
    ];

    let donations, donationAndCreations, deposits, withdrawals, payments;

    [donations, donationAndCreations, deposits, withdrawals, payments] = await Promise.all(eventPromises);

    let recordCreations = [];

    donations.map((donation => {
      recordCreations.push(
        app.service('donations').create({
          event: donation,
          giverCreation: false,
          matched: false,
        })
      )
    }));

    donationAndCreations.map((donation => {
      recordCreations.push(
        app.service('donations').create({
          event: donation,
          giverCreation: true,
          matched: false,
        })
      )
    }));

    deposits.map((deposit => {
      recordCreations.push(
        app.service('deposits').create({
          event: deposit,
          matched: false,
        })
      )
    }));

    withdrawals.map((withdrawal => {
      recordCreations.push(
        app.service('withdrawals').create({
          event: withdrawal,
          matched: false,
        })
      )
    }));

    payments.map((payment => {
      recordCreations.push(
        app.service('payments').create({
          event: payment,
          matched: false,
        })
      )
    }));

    await Promise.all(recordCreations);
    await Promise.resolve(updateRange);

}
