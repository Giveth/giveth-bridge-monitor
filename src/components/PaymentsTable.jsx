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
            accessor: datum => datum.event.returnValues.idPayment,
            width: 50,
          },
          {
            id: 'payTime',
            Header: 'Earliest Pay Time',
            accessor: datum => new Date(datum.earliestPayTime).toUTCString(),
            width: 250,
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
            accessor: datum => datum.event.returnValues.recipient,
          },
          {
            id: 'amount',
            Header: 'Amount',
            accessor: datum => Web3.utils.fromWei(datum.event.returnValues.amount),
            width: 100,
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

    return (
      <div class="authorized-payments">
        <div className="event-subcontainer">
          <span className="event-name">
            <strong>- Security Guard Last Checkin -</strong>
          </span>
          <span className="event-name">{new Date(this.props.lastCheckin).toUTCString()}</span>
          {securityGuardNeedsToCheckin() && (
            <p class="alert">Security Guard needs to checkin so payments can go out!</p>
          )}
          <span className="event-name">
            <strong>- Payments to Disburse -</strong>
          </span>
          <span className="event-name">
            [{this.props.payments
              .filter(p => this.getStatus(p) === 'Approved')
              .map(p => p.event.returnValues.idPayment)}]
          </span>
        </div>
        <div className="flex_container">
          <ReactTable
            style="flex-grow: 1;"
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
    );
  }
}

export default PaymentsTable;
