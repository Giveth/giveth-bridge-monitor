import React, {Component} from 'react';
import Web3 from 'web3';
import {GivethBridgeAbi} from 'giveth-bridge/build/contracts/GivethBridge.sol.js';
import {ForeignGivethBridgeAbi} from 'giveth-bridge/build/contracts/ForeignGivethBridge.sol.js';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import HomeToForeign from './HomeToForeign';
import ForeignToHome from './ForeignToHome';


class BridgeMonitor extends Component{

  constructor(props){
    super(props);

    const homeWeb3 = new Web3('http://localhost:8545');
    const foreignWeb3 = new Web3('http://localhost:8546');
    const blockRange = {fromBlock: '0', toBlock: 'latest'};
    const homeContract = new homeWeb3.eth.Contract(GivethBridgeAbi, '0x28337E63a325AEfc6C59E0f5f43Fc87943A3714a');
    const foreignContract = new foreignWeb3.eth.Contract(ForeignGivethBridgeAbi, '0x654a5675Ce63c03abF9b17864a96dBE29a392454');
    this.state = {
      Web3:{
        home: homeWeb3,
        foreign: foreignWeb3
      },
      blockRange,
      homeContract,
      foreignContract,
    };
  }


  // findContracts = async () => {
  //
  //   const homeContract = new this.state.Web3.home.eth.Contract(GivethBridgeAbi, '0x28337E63a325AEfc6C59E0f5f43Fc87943A3714a');
  //   const foreignContract = new this.state.Web3.foreign.eth.Contract(ForeignGivethBridgeAbi, '0x654a5675Ce63c03abF9b17864a96dBE29a392454');
  //   const range = {fromBlock: '0', toBlock: 'latest'};
  //   const promises = [
  //     homeContract.getPastEvents('Donate', range),
  //     homeContract.getPastEvents('DonateAndCreateGiver', range),
  //     foreignContract.getPastEvents('Deposit', range),
  //     foreignContract.getPastEvents('Withdraw', range),
  //     homeContract.getPastEvents('PaymentAuthorized', range)
  //   ];
  //   Promise.all(promises).then(
  //     ([homeDonations,
  //       homeGiverCreationDonations,
  //       foreignDeposits,
  //       foreignWithdrawals,
  //       homeAuthorizedPayments]) => {this.setState({
  //         homeDonations,
  //         homeGiverCreationDonations,
  //         foreignDeposits,
  //         foreignWithdrawals,
  //         homeAuthorizedPayments,
  //       });
  //     }
  //   );
  // }
  render(){
    return (
      <div>
        <Tabs  forceRenderTabPanel = {true}>
          
          <TabList>
            <Tab>Home ---> Foreign</Tab>
            <Tab>Foreign ---> Home </Tab>
          </TabList>

          <TabPanel>
            <HomeToForeign data = {this.state}></HomeToForeign>
          </TabPanel>

          <TabPanel>
            <ForeignToHome data = {this.state}></ForeignToHome>
          </TabPanel>

        </Tabs>
      </div>
    )
  }
}

export default BridgeMonitor;
