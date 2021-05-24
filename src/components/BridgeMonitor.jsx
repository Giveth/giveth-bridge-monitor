import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import feathers from '@feathersjs/client';
import io from 'socket.io-client';
import Header from './Header';
import EventTable from './EventTable';
import PaymentsTable from './PaymentsTable';
import Info from './Info';

import config from '../configuration';

class BridgeMonitor extends Component {
  constructor(props) {
    super(props);

    // Bridge feathers
    const bridgeSocket = io(config.feathersConnection, {
      transports: ['websocket'],
    });
    const bridgeClient = feathers();
    bridgeClient.configure(
      feathers.socketio(bridgeSocket, {
        timeout: 30000,
        pingTimeout: 30000,
        upgradeTimeout: 30000,
      }),
    );

    // Dapp feathers
    const dappSocket = io(config.feathersDappConnection);
    const dappClient = feathers();
    dappClient.configure(
      feathers.socketio(dappSocket, {
        timeout: 30000,
        pingTimeout: 30000,
        upgradeTimeout: 30000,
      }),
    );

    this.state = {
      bridge_client: bridgeClient,
      dapp_client: dappClient,
      donations: [],
      deposits: [],
      withdrawals: [],
      payments: [],
      info: {},
      recipients: {},
      milestones: {},
    };
    bridgeClient
      .service('information')
      .find()
      .then(info => {
        this.setState({
          info,
        });
      })
      .catch(e => console.error(e));

    this.loadEvents = this.loadEvents.bind(this);
    this.fetchDonations = this.fetchDonations.bind(this);
    this.fetchDeposits = this.fetchDeposits.bind(this);
    this.fetchPayments = this.fetchPayments.bind(this);
    this.fetchWithdrawals = this.fetchWithdrawals.bind(this);

    this.loadEvents();
  }

  async loadEvents() {
    this.fetchDonations(0, 10);

    this.fetchDeposits(0, 10);

    this.fetchWithdrawals(0, 10);

    this.fetchPayments(0, 10);

    setTimeout(this.loadEvents, 1000 * 60 * 5);
  }

  async fetchDonations(page, pageSize) {
    const client = this.state.bridge_client;
    client
      .service('donations')
      .find({
        query: {
          $limit: pageSize * 2,
          $skip: page * (pageSize * 2),
          $sort: {
            'event.blockNumber': -1,
          },
        },
      })
      .then(donations => {
        this.setState(prevState => {
          const d = prevState.donations.slice().concat(donations.data);
          return {
            donations: d.filter((obj, pos, arr) => {
              return arr.map(mapObj => mapObj._id).indexOf(obj._id) === pos;
            }),
          };
        });
      })
      .catch(e => console.error(e));
  }

  async fetchDeposits(page, pageSize) {
    const client = this.state.bridge_client;
    client
      .service('deposits')
      .find({
        query: {
          $limit: pageSize * 2,
          $skip: page * (pageSize * 2),
          $sort: {
            'event.blockNumber': -1,
          },
        },
      })
      .then(deposits => {
        this.setState(prevState => {
          const d = prevState.deposits.slice().concat(deposits.data);
          return {
            deposits: d.filter((obj, pos, arr) => {
              return arr.map(mapObj => mapObj._id).indexOf(obj._id) === pos;
            }),
          };
        });
      })
      .catch(e => console.error(e));
  }

  async fetchWithdrawals(page, pageSize) {
    const client = this.state.bridge_client;
    client
      .service('withdrawals')
      .find({
        query: {
          $limit: pageSize * 2,
          $skip: page * (pageSize * 2),
          $sort: {
            'event.blockNumber': -1,
          },
        },
      })
      .then(withdrawals => {
        this.setState(prevState => {
          const w = prevState.withdrawals.slice().concat(withdrawals.data);
          return {
            withdrawals: w.filter((obj, pos, arr) => {
              return arr.map(mapObj => mapObj._id).indexOf(obj._id) === pos;
            }),
          };
        });
      })
      .catch(e => console.error(e));
  }

  async fetchPayments(page, pageSize) {
    const client = this.state.bridge_client;
    client
      .service('payments')
      .find({
        query: {
          $limit: pageSize * 2,
          $skip: page * (pageSize * 2),
          $sort: {
            earliestPayTime: -1,
          },
        },
      })
      .then(payments => {
        const { data } = payments;
        const recipients = [];
        data.forEach(element => {
          if (element.event.returnValues) {
            const { recipient } = element.event.returnValues;
            if (
              !recipients.includes(recipient) &&
              !this.state.recipients.hasOwnProperty(recipient)
            ) {
              recipients.push(recipient);
              this.state.dapp_client
                .service('users')
                .find({
                  query: {
                    address: recipient,
                  },
                })
                .then(result => {
                  const r = { ...this.state.recipients };
                  if (result.data.length > 0 && result.data[0].name) {
                    r[recipient] = result.data[0].name;
                    this.setState({ recipients: r });
                  }
                });
            }
            const { reference } = element.event.returnValues;
            this.state.dapp_client
              .service('donations')
              .find({
                query: {
                  txHash: reference,
                },
              })
              .then(donation => {
                if (donation.data && donation.data.length > 0) {
                  this.state.dapp_client
                    .service('milestones')
                    .find({
                      query: {
                        _id: donation.data[0].ownerTypeId,
                      },
                    })
                    .then(result => {
                      const m = { ...this.state.milestones };
                      if (result.data.length > 0) {
                        const milestone = result.data[0];
                        m[
                          reference
                        ] = `${config.actualDappURL}campaigns/${milestone.campaignId}/milestones/${milestone._id}`;
                        this.setState({ milestones: m });
                      }
                    });
                }
              });
          }
        });
        this.setState(prevState => {
          const p = prevState.payments.slice().concat(payments.data);
          return {
            payments: p.filter((obj, pos, arr) => {
              return arr.map(mapObj => mapObj._id).indexOf(obj._id) === pos;
            }),
          };
        });
      })
      .catch(e => console.error(e));
  }

  render() {
    return (
      <div>
        <Header />
        <Tabs forceRenderTabPanel>
          <TabList>
            <Tab>Authorized Payments</Tab>
            <Tab>{`${config.homeNetworkName} -> ${config.foreignNetworkName}`}</Tab>
            <Tab>{`${config.foreignNetworkName} -> ${config.homeNetworkName}`}</Tab>
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
                  fetch={this.fetchDonations}
                  events={this.state.donations}
                  header={`${config.homeNetworkName} Deposits`}
                  duplicateMessage="This donation event has multiple deposits that reference it as their home transaction!"
                  duplicateTable
                  etherscanURL={config.homeEtherscanURL}
                />
              </div>
              <div className="column">
                <EventTable
                  fetch={this.fetchDeposits}
                  events={this.state.deposits}
                  header={`${config.foreignNetworkName} Deposits`}
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
                  fetch={this.fetchWithdrawals}
                  events={this.state.withdrawals}
                  header={`${config.foreignNetworkName} Withdrawals`}
                  duplicateMessage="This withdrawal event has multiple payments that reference it as their home transaction!"
                  duplicateTable
                  etherscanURL={config.foreignEtherscanURL}
                />
              </div>
              <div className="column">
                <EventTable
                  fetch={this.fetchPayments}
                  events={this.state.payments}
                  header={`${config.homeNetworkName} Withdrawals`}
                  duplicateMessage="The home transaction of this payment has other payments that also reference it!"
                  duplicateTable={false}
                  etherscanURL={config.homeEtherscanURL}
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <Info client={this.state.bridge_client} contracts={this.state.info} />
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

export default BridgeMonitor;
