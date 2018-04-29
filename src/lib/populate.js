const app = require('../app');
const Web3 = require('web3');
const HomeBridgeContract = require('giveth-bridge/build/contracts/GivethBridge.sol.js');
const HomeBridgeABI = HomeBridgeContract.GivethBridgeAbi;
const ForeignBridgeContract = require('giveth-bridge/build/contracts/ForeignGivethBridge.sol.js');
const ForeignBridgeABI = ForeignBridgeContract.ForeignGivethBridgeAbi;

const populate = async () => {

  const homeWeb3 = new Web3('http://localhost:8545');
  const foreignWeb3 = new Web3('http://localhost:8546');

  const homeContract = new homeWeb3.eth.Contract(HomeBridgeABI, '0x28337E63a325AEfc6C59E0f5f43Fc87943A3714a');
  const foreignContract = new foreignWeb3.eth.Contract(ForeignBridgeABI, '0x654a5675Ce63c03abF9b17864a96dBE29a392454');

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
      console.log('No saved block range found, starting search from first block to home block number ', currentHomeBlock, ' and foreign block number ', currentForeignBlock);
      searchRange = {
        home: {
          fromBlock: app.get('homeStart'),
          toBlock: currentHomeBlock,
        },
        foreign: {
          fromBlock: app.get('foreignStart'),
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
      console.log('Resuming search from home block number ', lastHomeBlockSearched);
      searchRange = {
        home: {
          fromBlock: lastHomeBlockSearched + 1,
          toBlock: 'latest',
        },
        foreign: {
          fromBlock: lastForeignBlockSearched + 1,
          toBlock: 'latest',
        }
      }

      updateRange = app.service('range').update(1, {
        home: currentHomeBlock,
        foreign: currentForeignBlock
      });

      break;
    }

    case 2: {
      // more than one saved range, this is bad and shouldn't happen
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
          return: donation,
          giverCreation: false,
        })
      )
    }));

    donationAndCreations.map((donation => {
      recordCreations.push(
        app.service('donations').create({
          return: donation,
          giverCreation: true,
        })
      )
    }));

    deposits.map((deposit => {
      recordCreations.push(
        app.service('deposits').create({
          return: deposit,
        })
      )
    }));

    withdrawals.map((withdrawal => {
      recordCreations.push(
        app.service('withdrawals').create({
          return: withdrawal,
        })
      )
    }));

    payments.map((payment => {
      recordCreations.push(
        app.service('payments').create({
          return: payment,
        })
      )
    }));

    await Promise.all(recordCreations);
    await Promise.resolve(updateRange);

}

populate();
