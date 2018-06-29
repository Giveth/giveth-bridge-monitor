import React, { Component } from 'react';
import ReactTable from 'react-table';
import Web3 from 'web3';

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
      default:
        color = 'rgba(255, 255, 155, 1)';
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
            accessor: datum => datum.event.idPayment,
          },
          {
            id: 'payTime',
            Header: 'Earliest Pay Time',
            accessor: datum => new Date(datum.earliestPayTime),
          },
          {
            id: 'status',
            Header: 'Status',
            accessor: datum => this.getStatus(datum),
            // Cell: row => <span> {(row.original.matched && !row.original.hasDuplicates)? '\u2714' : 	'\u2716'} </span>,
            width: 100,
            filterable: false,
          },
          {
            id: 'recipient',
            Header: 'Recipient',
            accessor: datum => datum.event.returnValues.recipient,
          },
          {
            id: 'amount',
            Header: 'Amount',
            accessor: datum => Web3.utils.fromWei(datum.event.returnValues.amount),
          },
          {
            id: 'token',
            Header: 'Token',
            accessor: datum => datum.event.returnValues.token,
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

    const style = {
      ['background-color']: 'red',
      color: 'black',
    };

    return (
      <div>
        <div className="event-subcontainer">
          <span className="event-name">- Security Guard Last Checkin -</span>
          <span className="event-name">{new Date(this.props.lastCheckin)}</span>
          {securityGuardNeedsToCheckin() && (
            <p style={style}>Security Guard needs to checkin so payments can go out!</p>
          )}
        </div>
        <div className="event-subcontainer">
          <span className="event-name">- Payments to Disburse -</span>
          <span className="event-name">
            {this.payments
              .filter(p => this.getStatus(p) === 'Approved')
              .map(p => p.event.returnValues.idPayment)}
          </span>
        </div>
        <div className="flex_container">
          <div className="column">
            <ReactTable
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
                  id: 'id',
                  desc: true,
                },
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PaymentsTable;
