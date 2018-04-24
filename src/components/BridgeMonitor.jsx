import React, {Component} from 'react';
import Web3 from 'web3';
import {GivethBridgeAbi} from 'giveth-bridge/build/contracts/GivethBridge.sol.js';
import {ForeignGivethBridgeAbi} from 'giveth-bridge/build/contracts/ForeignGivethBridge.sol.js';

class BrideMonitor extends Component{

  constructor(props){
    super(props);

    const homeWeb3 = new Web3('http://localhost:8545');
    const foreignWeb3 = new Web3('http://localhost:8546');
    this.state = {
      Web3:{
        home: homeWeb3,
        foreign: foreignWeb3
      },
      homeDonations: [],
      homeGiverCreationDonations: [],
      foreignDeposits: [],
      foreignWithdrawals: [],
      homeAuthorizedPayments: [],
    };
  }


  findContracts = async () => {

    const homeContract = new this.state.Web3.home.eth.Contract(GivethBridgeAbi, '0x28337E63a325AEfc6C59E0f5f43Fc87943A3714a');
    const foreignContract = new this.state.Web3.foreign.eth.Contract(ForeignGivethBridgeAbi, '0x654a5675Ce63c03abF9b17864a96dBE29a392454');
    const homeDonations = await homeContract.getPastEvents('Donate', {
      fromBlock: '0',
      toBlock: 'latest'
    });
    const homeGiverCreationDonations = await homeContract.getPastEvents('DonateAndCreateGiver', {
      fromBlock: '0',
      toBlock: 'latest'
    });
    const foreignDeposits = await foreignContract.getPastEvents('Deposit', {
      fromBlock: '0',
      toBlock: 'latest'
    });
    const foreignWithdrawals = await foreignContract.getPastEvents('Withdraw', {
      fromBlock: '0',
      toBlock: 'latest'
    });
    const homeAuthorizedPayments = await homeContract.getPastEvents('PaymentAuthorized', {
      fromBlock: '0',
      toBlock: 'latest'
    });
    this.setState({
      homeDonations: homeDonations,
      homeGiverCreationDonations: homeGiverCreationDonations,
      foreignDeposits: foreignDeposits,
      foreignWithdrawals: foreignWithdrawals,
      homeAuthorizedPayments: homeAuthorizedPayments,
    });
  }
  render(){
    return (
      <div>
        <h3> It's the bridge monitor folks</h3>
        <button onClick = {this.findContracts}> Find those contracts </button>
        <h5> Donations on Home Bridge</h5>
        <ul>
          {this.state.homeDonations.map((donation, idx) => {
            return(<li key = {idx}>{donation.returnValues.amount}</li>);
          })}
        </ul>
        <h5> Giver Creations w/ donations on Home Bridge</h5>
        <ul>
          {this.state.homeGiverCreationDonations.map((donation, idx) => {
            return(<li key = {idx}>{donation.returnValues.amount}</li>);
          })}
        </ul>
        <h5> Deposits on Foreign Bridge</h5>
        <ul>
          {this.state.foreignDeposits.map((deposit, idx) => {
            return(<li key = {idx}>{deposit.returnValues.amount}</li>);
          })}
        </ul>
        <h5> Withdrawls on Foreign Bridge</h5>
        <ul>
          {this.state.foreignWithdrawals.map((withdrawl, idx) => {
            return(<li key = {idx}>{withdrawl.returnValues.amount}</li>);
          })}
        </ul>
        <h5> Authorized Payments on Home Bridge</h5>
        <ul>
          {this.state.homeAuthorizedPayments.map((payment, idx) => {
            return(<li key = {idx}>{payment.returnValues.amount}</li>);
          })}
        </ul>
      </div>
    )
  }
};

export default BrideMonitor;
