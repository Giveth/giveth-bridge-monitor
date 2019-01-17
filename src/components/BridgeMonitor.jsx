import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import EventTable from './EventTable';
import PaymentsTable from './PaymentsTable';
import Info from './Info';

import config from '../configuration';
import feathers from '@feathersjs/client';
import io from 'socket.io-client';

class BridgeMonitor extends Component {
  constructor(props) {
    super(props);

    const socket = io(config.feathersConnection);
    const client = feathers();
    client.configure(
      feathers.socketio(socket, { timeout: 30000, pingTimeout: 30000, upgradeTimeout: 30000 }),
    );
    this.state = {
      client,
      donations: [],
      deposits: [],
      withdrawals: [],
      payments: [],
      info: {},
    };
    client
      .service('information')
      .find()
      .then(info => {
        this.setState({
          info,
        });
      });

    this.loadEvents();
  }

  loadEvents = async () => {
    const client = this.state.client;

    client
      .service('donations')
      .find({ query: { $sort: { 'event.blockNumber': -1 } } })
      .then(donations => {
        this.setState({
          donations: donations.data,
        });
      });

    client
      .service('deposits')
      .find({ query: { $sort: { 'event.blockNumber': -1 } } })
      .then(deposits => {
        this.setState({
          deposits: deposits.data,
        });
      });

    client
      .service('withdrawals')
      .find({ query: { $sort: { 'event.blockNumber': -1 } } })
      .then(withdrawals => {
        this.setState({
          withdrawals: withdrawals.data,
        });
      });

    client
      .service('payments')
      .find({ query: { $sort: { 'event.blockNumber': -1 } } })
      .then(payments => {
        this.setState({
          payments: payments.data,
        });
      });
    setTimeout(this.loadEvents, 5000);
  };

  render() {
    return (
      <div>
        <Tabs forceRenderTabPanel={true}>
          <TabList>
            <Tab>Authorized Payments</Tab>
            <Tab>Home &#8594; Foreign</Tab>
            <Tab>Foreign &#8594; Home </Tab>
            <Tab> Info and Utilities </Tab>
          </TabList>

          <TabPanel>
            <div>
              <PaymentsTable
                payments={this.state.payments}
                lastCheckin={this.state.info.securityGuardLastCheckin}
              />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="flex_container">
              <div className="column">
                <EventTable
                  events={this.state.donations}
                  header="Home Donations"
                  duplicateMessage="This donation event has multiple deposits that reference it as their home transaction!"
                  duplicateTable={true}
                  etherscanURL={config.homeEtherscanURL}
                />
              </div>
              <div className="column">
                <EventTable
                  events={this.state.deposits}
                  header="Foreign Deposits"
                  duplicateMessage="The home transaction of this deposit has other deposits that also reference it!"
                  duplicateTable={false}
                  etherscanURL={config.foreignEtherscanURL}
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="flex_container">
              <div className="column">
                <EventTable
                  events={this.state.withdrawals}
                  header="Foreign Withdrawals"
                  duplicateMessage="This withdrawal event has multiple payments that reference it as their home transaction!"
                  duplicateTable={true}
                  etherscanURL={config.foreignEtherscanURL}
                />
              </div>
              <div className="column">
                <EventTable
                  events={this.state.payments}
                  header="Home Payments"
                  duplicateMessage="The home transaction of this payment has other payments that also reference it!"
                  duplicateTable={false}
                  etherscanURL={config.homeEtherscanURL}
                />
              </div>
            </div>
          </TabPanel>
          
          <TabPanel>
            <Info client={this.state.client} contracts={this.state.info} />
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

export default BridgeMonitor;
