import React, { Component } from 'react';
import ReactTable from 'react-table';
import Web3 from 'web3';
import feathers from '@feathersjs/client';
import io from 'socket.io-client';
import config from '../configuration';

const client = feathers();
client.configure(feathers.socketio(io(config.feathersDappConnection)));


class PaymentsTable extends Component {
  getRowColor = row => {
    let color;
    const status = this.getStatus(row.original);
    switch (status) {
      case 'Canceled':
        color = 'rgba(176, 0, 0, 0.5)';
        break;
      case 'Paid':
        color = 'rgba(85, 176, 0, 0.5)';
        break;
      case 'Approved':
        color = 'rgba(85, 176, 0, 0.25)';
        break;
      case 'Delayed':
        color = 'rgba(242, 210, 0, 0.5)';
        break;
    }
    return color;
  };

  getTrProps = (state, row, instance) => {
    if (row) {
      return {
        style: {
          background: this.getRowColor(row),
          color: 'rgba(24, 24, 24, 0.8)',
        },
      };
    }
    return {};
  };

  getStatus = data => {
    if (data.canceled) return 'Canceled';
    if (data.paid) return 'Paid';
    if (data.earliestPayTime <= Date.now()) return 'Approved';
    // this means that earliestPayTime hasn't passed
    if (data.securityGuardDelay > 0) return 'Delayed';
    return 'Pending';
  };

  getTokenName = (tokenAddress) => {
    if (tokenAddress === "0x0000000000000000000000000000000000000000") return 'ETH';
    else if (tokenAddress === "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359") return 'DAI';
    else return tokenAddress;
  };

  render() {
    const columns = [
      {
        Header: 'Authorized Payments',
        headerClassName: 'hc',
        columns: [
          // {
          //   id: 'afterLastCheckin',
          //   Header: () => <span> {'\u2714'} </span>,
          //   // accessor: datum => this.rankByError(datum),
          //   Cell: row => <span> {(row.original.&& !row.original.hasDuplicates)? '\u2714' : 	'\u2716'} </span>,
          //   width: 25,
          //   resizable: false,
          // },
          {
            id: 'ids',
            Header: 'ID',
            accessor: datum => parseInt(datum.event.returnValues.idPayment),
            width: 50,
          },
          {
            id: 'payTime',
            Header: 'Earliest Pay Time',
            accessor: datum => new Date(datum.earliestPayTime).toUTCString(),
            width: 220,
            sortable: false,
          },
          {
            id: 'status',
            Header: 'Status',
            accessor: datum => this.getStatus(datum),
            // Cell: row => <span> {(row.original.matched && !row.original.hasDuplicates)? '\u2714' : 	'\u2716'} </span>,
            width: 100,
          },
          {
            id: 'recipient',
            Header: 'Recipient',
            accessor: datum => this.props.recipients.hasOwnProperty(datum.event.returnValues.recipient) ? this.props.recipients[datum.event.returnValues.recipient] : datum.event.returnValues.recipient
          },
          {
            id: 'amount',
            Header: 'Amount',
            accessor: datum => parseFloat(Web3.utils.fromWei(datum.event.returnValues.amount)),
            width: 150,
          },
          {
            id: 'token',
            Header: 'Token',
            accessor: datum => this.getTokenName(datum.event.returnValues.token),
            width: 60,
          },
          {
            id: 'reference',
            Header: 'Reference',
            accessor: datum => datum.event.returnValues.reference,
            show: false,
          },
        ],
      },
    ];

    const securityGuardNeedsToCheckin = () => {
      return (
        new Date(this.props.lastCheckin) < Date.now() - 1000 * 60 * 60 * 48 && // 48 hrs ago
        this.props.payments.some(p => this.getStatus(p) === 'Approved')
      );
    };

    return (
      <div className="authorized-payments">
        <div className="event-subcontainer">
          <span className="event-name">
            <strong>- Security Guard Last Checkin -</strong>
          </span>
          <span className="event-name">{new Date(this.props.lastCheckin).toUTCString()}</span>
          {securityGuardNeedsToCheckin() && (
            <p className="alert">Security Guard needs to checkin so payments can go out!</p>
          )}
          <span className="event-name">
            <strong>- Payments to Disburse -</strong>
          </span>
          <span className="event-name">
            [{this.props.payments
              .filter(p => this.getStatus(p) === 'Approved')
              .map(p => p.event.returnValues.idPayment)
              .join(', ')}]
          </span>
        </div>
        <div className="event-name"><strong>Click on any row to show the related milestone.</strong><br></br>Please make sure you have enabled pop-ups on this site.</div>
        <div className="flex_container">
          <ReactTable
            flexGrow={1}
            data={this.props.payments}
            columns={columns}
            showPagination={false}
            sortable={true}
            filterable={true}
            pageSize={this.props.payments.length}
            getTrProps={this.getTrProps}
            collapseOnDataChange={false}
            defaultSorted={[
              {
                id: 'ids',
                desc: true,
              },
            ]}
            getTdProps={(state, rowInfo, column, instance) => {
              return {
                onClick: async e => {
                  try {
                    const resp = await client.service('milestones').find({
                      query: {
                        txHash: rowInfo.row.reference,
                      },
                    });
                    const milestone = resp.data[0]
                    const url = `${config.actualDappURL}campaigns/${milestone.campaignId}/milestones/${milestone._id}`;
                    window.open(url, '_blank');
                  } catch (e2) {
                    console.error(e2);
                  }
                }

              };
            }}
          />
        </div>
      </div>
    );
  }
}

export default PaymentsTable;
