import React, {Component} from 'react';
import ReactTable from 'react-table';
import Web3 from 'web3';

import EventDetail from './EventDetail';


class ForeignToHome extends Component{

  constructor(props){
    super(props);
    this.state = {
      withdrawals: [],
      payments: [],
    }
    this.loadEvents();
  }
  // TODO: only load events if new events have been added to the feathers app since last time loadEvents was called
  loadEvents = async () => {
    const client = this.props.client;
    client.service('withdrawals').find().then((withdrawals) => {
      this.setState({
        withdrawals: withdrawals.data,
      });
    });
    client.service('payments').find().then((payments) => {
      this.setState({
        payments: payments.data,
      });
    });
    //setTimeout(this.loadEvents, 1000);
  }
  getRowColor = (row) => {
    let color;
    if (!row.original.matched) {
      color = 'rgba(176, 0, 0, 0.5)';
    }
    else if (row.original.hasDuplicates) {
      color = 'rgba(242, 210, 0, 0.5)';
    }
    else {
      color = 'rgba(85, 176, 0, 0.5)';
    }
    return color;
  }

  getTrProps = (state, row, instance) => {
    if (row) {

      return {
        style: {
          background: this.getRowColor(row),
          //border: rowInfo.original.matched? '1px solid green' : '1px solid red',
          color: 'rgba(24, 24, 24, 0.8)'
        }
      }
    }
    return {};
  }
  rankByError = (data) => {
    let rank;
    const matched = data.matched;
    const duplicated = data.hasDuplicates;

    if (!matched) rank = 0;
    else if (duplicated) rank = 1;
    else rank = 2;

    return rank;
  }
  render() {
    const withdrawalColumns = [
      {
        Header: 'Foreign Withdrawals',
        headerClassName: 'withdrawals',
        columns: [
          {
            id: 'matched',
            Header: () => <span> {'\u2714'} </span>,
            accessor: datum => this.rankByError(datum),
            Cell: row => <span> {(row.original.matched && !row.original.hasDuplicates)? '\u2714' : 	'\u2716'} </span>,
            width: 25,
            resizable: false,
            filterable: false,
          },
          {
            id: 'hashes',
            Header: 'Hash',
            accessor: datum => datum.event.transactionHash,
          },
          {
            id: 'amount',
            Header: 'Amount (ETH)',
            accessor: datum => Web3.utils.fromWei(datum.event.returnValues.amount)
          },
          {
            id: 'block',
            Header: 'Block #',
            accessor: datum => datum.event.blockNumber.toLocaleString()
          }]
      }
    ];

    const paymentColumns = [
      {
        Header: 'Home Payments',
        headerClassName: 'payments',
        columns: [
          {
            id: 'matched',
            Header: () => <span> {'\u2714'} </span>,
            accessor: datum => this.rankByError(datum),
            Cell: row => <span> {(row.original.matched && !row.original.hasDuplicates)? '\u2714' : 	'\u2716'} </span>,
            width: 25,
            resizable: false,
            filterable: false,
          },
          {
            id: 'hashes',
            Header: 'Hash',
            accessor: datum => datum.event.transactionHash,
          },
          {
            id: 'amount',
            Header: 'Amount (ETH)',
            accessor: datum => Web3.utils.fromWei(datum.event.returnValues.amount)
          },
          {
            id: 'block',
            Header: 'Block #',
            accessor: datum => datum.event.blockNumber.toLocaleString()
          }]
      }
    ];

    const withdrawalDuplicateMessage = 'This withdrawal event has multiple payments that reference it as their home transaction!';
    const paymentDuplicateMessage = 'The home transaction of this payment has other payments that also reference it!';

    return(
      <div>
        <div className = "flex_container">
          <div className = "column">
            <ReactTable
              data = {this.state.withdrawals}
              columns = {withdrawalColumns}
              className = "-striped"
              showPagination = {false}
              sortable = {true}
              filterable = {true}
              pageSize = {this.state.withdrawals.length}
              getTrProps = {this.getTrProps}
              defaultSorted = {[
                {
                  id: 'block',
                  desc: true
                }
              ]}
              SubComponent = {row => (
                <EventDetail data = {row.original} duplicateMessage = {withdrawalDuplicateMessage} borderColor = {this.getRowColor(row)}/>
              )}/>
          </div>
          <div className = "column">
            <ReactTable
              data = {this.state.payments}
              columns = {paymentColumns}
              className = "-striped"
              showPagination = {false}
              sortable = {true}
              filterable = {true}
              pageSize = {this.state.payments.length}
              getTrProps = {this.getTrProps}
              defaultSorted = {[
                {
                  id: 'block',
                  desc: true
                }
              ]}
              SubComponent = {row => (
                <EventDetail data = {row.original} duplicateMessage = {paymentDuplicateMessage} borderColor = {this.getRowColor(row)}/>
              )}/>
          </div>
        </div>
      </div>
    );
  }

}

export default ForeignToHome;
