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
      recipients: {},
      milestones: {}
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

    this.fetchPayments(0, 10);

    setTimeout(this.loadEvents, 1000 * 60 * 5);
  };

  fetchPayments = async (page, pageSize) => {
    const client = this.state.bridge_client;
    client
      .service('payments')
      .find({
        query: {
          $limit: pageSize * 2,
          $skip: page * (pageSize * 2),
          $sort: {
            earliestPayTime: -1
          }
        }
      })
      .then(payments => {
        var data = payments.data;
        var recipients = [];
        data.forEach(element => {
          if (element.event.returnValues) {
            var recipient = element.event.returnValues.recipient;
            if (
              !recipients.includes(recipient) &&
              !this.state.recipients.hasOwnProperty(recipient)
            ) {
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
                  if (result.data.length > 0 && result.data[0].name) {
                    r[recipient] = result.data[0].name;
                    this.setState({ recipients: r });
                  }
                });
            }
            var reference = element.event.returnValues.reference;
            this.state.dapp_client
              .service('donations')
              .find({
                query: {
                  txHash: reference
                }
              })
              .then(donation => {
                if (donation.data && donation.data.length > 0) {
                  this.state.dapp_client
                    .service('milestones')
                    .find({
                      query: {
                        _id: donation.data[0].ownerTypeId
                      }
                    })
                    .then(result => {
                      let m = Object.assign({}, this.state.milestones);
                      if (result.data.length > 0) {
                        let milestone = result.data[0];
                        m[reference] = `${config.actualDappURL}campaigns/${
                          milestone.campaignId
                          }/milestones/${milestone._id}`;
                        this.setState({ milestones: m });
                      }
                    });
                }
              });
          }
        });
        var p = this.state.payments.slice().concat(payments.data);
        this.setState({
          payments: p.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj['_id']).indexOf(obj['_id']) === pos;
          })
        });
      });
  };

  render() {
    return (
      <div>
        <Tabs forceRenderTabPanel={true}>
          <TabList>
            <Tab>Authorized Payments</Tab>
            <Tab>
              {config.homeNetworkName + ' -> ' + config.foreignNetworkName}
            </Tab>
            <Tab>
              {config.foreignNetworkName + ' -> ' + config.homeNetworkName}
            </Tab>
            <Tab> Info and Utilities </Tab>
          </TabList>

          <TabPanel>
            <div>
              <PaymentsTable
                fetchPayments={this.fetchPayments}
                recipients={this.state.recipients}
                milestones={this.state.milestones}
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
