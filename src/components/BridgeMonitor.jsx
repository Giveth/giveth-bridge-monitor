import React, {Component} from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import HomeToForeign from './HomeToForeign';
import ForeignToHome from './ForeignToHome';
import Info from './Info';

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

  }
  render(){
    return (
      <div>
        <Tabs forceRenderTabPanel = {true}>

          <TabList>
            <Tab>Home &#8594; Foreign</Tab>
            <Tab>Foreign &#8594; Home </Tab>
            <Tab> Info and Utilities </Tab>
          </TabList>

          <TabPanel>
            <HomeToForeign client = {this.state.client}/>
          </TabPanel>

          <TabPanel>
            <ForeignToHome client = {this.state.client}/>
          </TabPanel>

          <TabPanel>
            <Info client = {this.state.client}/>
          </TabPanel>
        </Tabs>
      </div>
    )
  }
}

export default BridgeMonitor;
