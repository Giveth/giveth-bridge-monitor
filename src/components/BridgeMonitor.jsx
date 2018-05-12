import React, {Component} from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import HomeToForeign from './HomeToForeign';
import ForeignToHome from './ForeignToHome';
import config from '../configuration';
import feathers from '@feathersjs/client';
import io from 'socket.io-client';

class BridgeMonitor extends Component{

  constructor(props){
    super(props);

    const socket = io(config.feathersConnection);
    const client = feathers();
    client.configure(feathers.socketio(socket)); 
    this.state = {
      client,
    };
    this.loadEvents();
  }
  loadEvents = async () => {
    const client = this.state.client;
    client.service('donations').find().then((donations) => this.setState({donations: donations.data}));
    client.service('deposits').find().then((deposits) => this.setState({deposits: deposits.data}));
    client.service('withdrawals').find().then((withdrawals) => this.setState({withdrawals: withdrawals.data}));
    client.service('payments').find().then((payments) => this.setState({payments: payments.data}));
  }
  test = () => {
    const donations = this.state.donations;
    const deposits = this.state.deposits;

    const testDuplicates = deposits.filter((deposit) => {
      return deposit.event.returnValues.homeTx === '0x482d92eb1bbc810535922c18d8d9ca722a8ffd7d32c3b57b14cbe84cf7e4d7a3';
    });
    console.log(testDuplicates);
    console.log(this.state.withdrawals);
    console.log(this.state.payments);

  }
  render(){
    return (
      <div>
        <button onClick = {this.test}>Do it</button>
        <Tabs forceRenderTabPanel = {true}>

          <TabList>
            <Tab>Home &#8594; Foreign</Tab>
            <Tab>Foreign &#8594; Home </Tab>
          </TabList>

          <TabPanel>
            <HomeToForeign client = {this.state.client}/>
          </TabPanel>

          <TabPanel>
            <ForeignToHome client = {this.state.client}/>
          </TabPanel>

        </Tabs>
      </div>
    )
  }
}

export default BridgeMonitor;
