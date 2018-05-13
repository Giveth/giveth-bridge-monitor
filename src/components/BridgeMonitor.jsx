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

  render(){
    return (
      <div>
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
