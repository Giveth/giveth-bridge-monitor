const Web3 = require('web3');
const HomeBridgeContract = require('giveth-bridge/build/GivethBridge.json');
const ForeignBridgeContract = require('giveth-bridge/build/ForeignGivethBridge.json');
const app = require('../app');

const HomeBridgeABI = HomeBridgeContract.compilerOutput.abi;
const ForeignBridgeABI = ForeignBridgeContract.compilerOutput.abi;

let homeWeb3;
let foreignWeb3;
let homeContract;
let foreignContract;

const getHomeWeb3 = () => {
  if (!homeWeb3) {
    const homeNodeURL = app.get('homeNodeURL');
    homeWeb3 = new Web3(homeNodeURL);
  }
  return homeWeb3;
};

const getForeignWeb3 = () => {
  if (!foreignWeb3) {
    const foreignNodeURL = app.get('foreignNodeURL');
    foreignWeb3 = new Web3(foreignNodeURL);
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
