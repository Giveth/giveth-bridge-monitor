const HomeBridgeContract = require('@giveth/bridge-contract/build/GivethBridge.json');
const ForeignBridgeContract = require('@giveth/bridge-contract/build/ForeignGivethBridge.json')
const Web3 = require('web3');
const logger = require('winston');
const EventEmitter = require('events');
const app = require('../app');

const THIRTY_SECONDS = 30 * 1000;

// if the websocket connection drops, attempt to re-connect
// upon successful re-connection, we re-start all listeners
const reconnectOnEnd = (web3Core, nodeUrl) => {
  const web3 = web3Core;
  web3.currentProvider.on('end', e => {
    if (web3.reconnectInterval) return;

    web3.emit(web3.DISCONNECT_EVENT);
    logger.error(`connection closed reason: ${e.reason}, code: ${e.code}`);

    web3.pingInterval = undefined;

    web3.reconnectInterval = setInterval(() => {
      logger.info('attempting to reconnect');

      const newProvider = new web3.providers.WebsocketProvider(nodeUrl);

      newProvider.on('connect', () => {
        logger.info('successfully connected');
        clearInterval(web3.reconnectInterval);
        web3.reconnectInterval = undefined;
        // note: "connection not open on send()" will appear in the logs when setProvider is called
        // This is because web3.setProvider will attempt to clear any subscriptions on the currentProvider
        // before setting the newProvider. Our currentProvider has been disconnected, so thus the not open
        // error is logged
        web3.setProvider(newProvider);
        // attach reconnection logic to newProvider
        reconnectOnEnd(web3, nodeUrl);
        web3.emit(web3.RECONNECT_EVENT);
      });
    }, THIRTY_SECONDS);
  });
};

function instantiateWeb3(nodeUrl) {
  const provider =
    nodeUrl && nodeUrl.startsWith('ws')
      ? new Web3.providers.WebsocketProvider(nodeUrl, {
          clientConfig: {
            maxReceivedFrameSize: 100000000,
            maxReceivedMessageSize: 100000000,
          },
        })
      : nodeUrl;
  const w3 = Object.assign(new Web3(provider), EventEmitter.prototype);

  if (w3.currentProvider.on) {
    w3.currentProvider.on('connect', () => {
      // keep geth node connection alive
      w3.pingInterval = setInterval(w3.eth.net.getId, 45 * 1000);
    });

    // attach the re-connection logic to the current web3 provider
    reconnectOnEnd(w3, nodeUrl);

    Object.assign(w3, {
      DISCONNECT_EVENT: 'disconnect',
      RECONNECT_EVENT: 'reconnect',
    });
  }

  return w3;
}
const HomeBridgeABI = HomeBridgeContract.compilerOutput.abi;
const ForeignBridgeABI = ForeignBridgeContract.compilerOutput.abi;

let homeWeb3;
let foreignWeb3;
let homeContract;
let foreignContract;

const getHomeWeb3 = () => {
  if (!homeWeb3) {
    const homeNodeURL = app.get('homeNodeURL');
    homeWeb3 = instantiateWeb3(homeNodeURL);
  }
  return homeWeb3;
};

const getForeignWeb3 = () => {
  if (!foreignWeb3) {
    const foreignNodeURL = app.get('foreignNodeURL');
    foreignWeb3 = instantiateWeb3(foreignNodeURL);
  }
  return foreignWeb3;
};

const getHomeContract = () => {
  if (!homeContract) {
    const web3 = getHomeWeb3();
    const homeContractAddress = app.get('homeContractAddress');
    homeContract = new web3.eth.Contract(HomeBridgeABI, homeContractAddress);
  }
  return homeContract;
};

const getForeignContract = () => {
  if (!foreignContract) {
    const web3 = getForeignWeb3();
    const foreignContractAddress = app.get('foreignContractAddress');
    foreignContract = new web3.eth.Contract(ForeignBridgeABI, foreignContractAddress);
  }
  return foreignContract;
};

module.exports = {
  getHomeWeb3,
  getForeignWeb3,
  getHomeContract,
  getForeignContract,
};
