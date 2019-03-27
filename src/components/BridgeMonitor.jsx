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

    // Bridge feathers
    const bridge_socket = io(config.feathersConnection);
    const bridge_client = feathers();
    bridge_client.configure(
      feathers.socketio(bridge_socket, {
        timeout: 30000,
        pingTimeout: 30000,
        upgradeTimeout: 30000
      })
    );

    // Dapp feathers
    const dapp_socket = io(config.feathersDappConnection);
    const dapp_client = feathers();
    dapp_client.configure(
      feathers.socketio(dapp_socket, {
        timeout: 30000,
        pingTimeout: 30000,
        upgradeTimeout: 30000
      })
    );

    this.state = {
      bridge_client,
      dapp_client,
      donations: [],
      deposits: [],
      withdrawals: [],
      payments: [],
      info: {},
      recipients: {}
    };
    bridge_client
      .service('information')
      .find()
      .then(info => {
        this.setState({
          info
        });
      });

    this.loadEvents();
  }

  loadEvents = async () => {
    const client = this.state.bridge_client;

    client
      .service('donations')
      .find()
      .then(donations => {
        this.setState({
          donations: donations.data
        });
      });

    client
      .service('deposits')
      .find()
      .then(deposits => {
        this.setState({
          deposits: deposits.data
        });
      });

    client
      .service('withdrawals')
      .find()
      .then(withdrawals => {
        this.setState({
          withdrawals: withdrawals.data
        });
      });

    client
      .service('payments')
      .find()
      .then(payments => {
        var data = payments.data;
        var recipients = [];
        data.forEach(element => {
          if (element.event.returnValues) {
            var recipient = element.event.returnValues.recipient;
            if (!recipients.includes(recipient)) {
              recipients.push(recipient);
              this.state.dapp_client
                .service('users')
                .find({
                  query: {
                    address: recipient
                  }
                })
                .then(result => {
                  let r = Object.assign({}, this.state.recipients);
                  console.log(result.data);
                  if (result.data.length > 0 && result.data[0].name) {
                    r[recipient] = result.data[0].name;
                    this.setState({ recipients: r });
                    console.log(r);
                  }
                });
            }
          }
        });
        this.setState({
          payments: payments.data
        });
      });
    setTimeout(this.loadEvents, 1000 * 60 * 5);
  };

  render() {
    return (
      <div>
        <Tabs forceRenderTabPanel={true}>
          <TabList>
            <Tab>Authorized Payments</Tab>
            <Tab>
              {config.homeNetworkName + " -> " + config.foreignNetworkName}
            </Tab>
            <Tab>
              {config.foreignNetworkName + " -> " + config.homeNetworkName}
            </Tab>
            <Tab> Info and Utilities </Tab>
          </TabList>

          <TabPanel>
            <div>
              <PaymentsTable
                recipients={this.state.recipients}
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
                  header={config.homeNetworkName + " Deposits"}
                  duplicateMessage="This donation event has multiple deposits that reference it as their home transaction!"
                  duplicateTable={true}
                  etherscanURL={config.homeEtherscanURL}
                />
              </div>
              <div className="column">
                <EventTable
                  events={this.state.deposits}
                  header={config.foreignNetworkName + " Deposits"}
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
                  header={config.foreignNetworkName + " Withdrawls"}
                  duplicateMessage="This withdrawal event has multiple payments that reference it as their home transaction!"
                  duplicateTable={true}
                  etherscanURL={config.foreignEtherscanURL}
                />
              </div>
              <div className="column">
                <EventTable
                  events={this.state.payments}
                  header={config.homeNetworkName + " Withdrawls"}
                  duplicateMessage="The home transaction of this payment has other payments that also reference it!"
                  duplicateTable={false}
                  etherscanURL={config.homeEtherscanURL}
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <Info
              client={this.state.bridge_client}
              contracts={this.state.info}
            />
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

export default BridgeMonitor;
