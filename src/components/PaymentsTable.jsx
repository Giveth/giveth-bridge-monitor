import React, { Component } from 'react';
import ReactTable from 'react-table';
import Web3 from 'web3';
import feathers from '@feathersjs/client';
import io from 'socket.io-client';
import config from '../configuration';

import Web3Button from './Web3Button';
import DelayModal from './DelayModal';
import DateLabel from './DateLabel';

const client = feathers();
client.configure(feathers.socketio(io(config.feathersDappConnection)));


class PaymentsTable extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      delayId: -1
    };
  }

  componentDidMount() {
    this.page = 0;
    this.pageSize = 10;
  }

  getRowColor = row => {
    let color;
    const status = this.getStatus(row.original);
    switch (status) {
      case 'Canceled':
        color = 'rgba(176, 0, 0, 0.5)';
        break;
      case 'Paid':
        color = 'rgba(0, 100, 0, .35)';
        break;
      case 'Approved':
        color = 'rgba(85, 176, 0, 0.5)';
        break;
      case 'Delayed':
        color = 'rgba(242, 210, 0, 0.5)';
        break;
      default:
        color = 'rgba(255, 255, 255, 1)';
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
    else if (tokenAddress === "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359") return 'SAI';
    else if (tokenAddress === "0x6B175474E89094C44Da98b954EedeAC495271d0F") return 'DAI';
    else if (tokenAddress === "0xD56daC73A4d6766464b38ec6D91eB45Ce7457c44") return 'PAN';
    else if (tokenAddress === "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599") return 'WBTC';
    else if (tokenAddress === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48") return 'UDSC';
    else if (tokenAddress === "0xa117000000f279D81A1D3cc75430fAA017FA5A2e") return 'ANT';
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
            accessor: datum => datum.earliestPayTime,
            width: 220,
            sortable: false,
            Cell: ({ row }) => {
              return <DateLabel date={row.payTime} />
            }
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
            Cell: ({ row }) => {
              return (<a target="_blank" rel="noopener noreferrer" href={(`${config.actualDappURL}profile/${row._original.event.returnValues.recipient}`)}>
                {(this.props.recipients.hasOwnProperty(row._original.event.returnValues.recipient) ? this.props.recipients[row._original.event.returnValues.recipient] : "Unknown") + " - " + row._original.event.returnValues.recipient}
              </a>)
            },
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
            id: 'link',
            Header: 'Link',
            width: 80,
            Cell: ({ row }) => {
              if (this.props.milestones.hasOwnProperty(row._original.event.returnValues.reference)) {
                return (<a target="_blank" rel="noopener noreferrer" href={this.props.milestones[row._original.event.returnValues.reference]}>Milestone</a>)
              } else {
                return "Unknown"
              }
            },
          },
          {
            id: 'actions',
            Header: 'Actions',
            width: 110,
            Cell: ({ row }) => {
              return (<div><Web3Button show={(context) => (config.whitelist.includes(context.account) || row._original.event.returnValues.recipient === context.account) && row.status === 'Approved'} onClick={(context) => {
                let contract = config.getContract(context);
                if (contract) {
                  contract.methods.disburseAuthorizedPayment(row.ids).send({from: context.account})
                }
              }} text="Pay" />
              <Web3Button show={(context) => config.whitelist.includes(context.account) && row.status !== 'Paid'} onClick={() => {this.setState({delayId: row.ids})}} text="Delay" /></div>)
            },
          },
        ],
      },
    ];

    const securityGuardNeedsToCheckin = () => {
      return (
        new Date(this.props.lastCheckin) < Date.now() - 1000 * 60 * 60 * 25 && // 25 hrs ago
        this.props.payments.some(p => this.getStatus(p) === 'Approved')
      );
    };

    const pendingPayments = this.props.payments
      .filter(p => this.getStatus(p) === 'Approved')
      .map(p => p.event.returnValues.idPayment);

    return (
      <div className="authorized-payments">
      <DelayModal handleClose={() => this.setState({delayId: -1})} delayId={this.state.delayId} />
        <div className="event-subcontainer">
          <span className="event-name">
            <strong>- Security Guard Last Checkin -</strong>
          </span>
          <span className="event-name"><DateLabel date={this.props.lastCheckin} /></span>
          {securityGuardNeedsToCheckin() && (
            <p className="alert">Security Guard needs to checkin so payments can go out!</p>
          )}
          <Web3Button show={(context) => config.whitelist.includes(context.account)} onClick={(context) => {
            let contract = config.getContract(context);
            if (contract) {
              contract.methods.checkIn().send({from: context.account})
            }
          }} text="Check In" />
          
          <span className="event-name">
            <strong>- Payments to Disburse -</strong>
          </span>
          <span className="event-name">
            [{pendingPayments.toString()}]
          </span>
          <Web3Button show={(context) => config.whitelist.includes(context.account) && pendingPayments.length > 0} onClick={(context) => {
            let contract = config.getContract(context);
            if (contract) {
              contract.methods.disburseAuthorizedPayments(pendingPayments).send({from: context.account})
            }
          }} text="Disburse All Payments" />
        </div>
        <div className="event-name">Please make sure you have enabled pop-ups on this site.</div>
        <div className="flex_container">
          <ReactTable
            flexGrow={1}
            data={this.props.payments}
            columns={columns}
            showPagination={true}
            showPaginationBottom={true}
            defaultPageSize={10}
            onPageChange={page => {
              if(page > this.page){
                this.props.fetchPayments(page, this.pageSize);
              }
              this.page = page;
            }}
            onPageSizeChange={pageSize => {
              if(pageSize > this.pageSize){
                this.props.fetchPayments(this.page, pageSize);
              }
              this.pageSize = pageSize;
            }}
            sortable={true}
            filterable={true}
            getTrProps={this.getTrProps}
            collapseOnDataChange={false}
            defaultSorted={[
              {
                id: 'ids',
                desc: true,
              },
            ]}
          />
        </div>
      </div>
    );
  }
}

export default PaymentsTable;
