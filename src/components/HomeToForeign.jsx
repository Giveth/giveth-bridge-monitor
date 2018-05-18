import React, {Component} from 'react';
import ReactTable from 'react-table';
import Web3 from 'web3';

import EventDetail from './EventDetail';

import 'react-table/react-table.css';
import "../styles/styles.css";

class HomeToForeign extends Component{

  constructor(props){
    super(props);
    this.state = {
      donations: [],
      deposits: [],
    }
    this.loadEvents();
  }
  // TODO: only load events if new events have been added to the feathers app since last time loadEvents was called
  loadEvents = async () => {
    const client = this.props.client;
    client.service('donations').find().then((donations) => {
      this.setState({
        donations: donations.data,
      });
    });
    client.service('deposits').find().then((deposits) => {
      this.setState({
        deposits: deposits.data,
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
    const donationColumns = [
      {
        Header: 'Home Donations',
        headerClassName: 'donations',
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

    const depositColumns = [
      {
        Header: 'Foreign Deposits',
        headerClassName: 'deposits',
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

    const donationDuplicateMessage = 'This donation event has multiple deposits that reference it as their home transaction!';
    const depositDuplicateMessage = 'The home transaction of this deposit has other deposits that also reference it!';

    return(
      <div>
        <div className = "flex_container">
          <div className = "column">
            <ReactTable
              data = {this.state.donations}
              columns = {donationColumns}
              className = "-striped"
              showPagination = {false}
              sortable = {true}
              filterable = {true}
              pageSize = {this.state.donations.length}
              getTrProps = {this.getTrProps}
              defaultSorted = {[
                {
                  id: 'block',
                  desc: true
                }
              ]}
              SubComponent = {row => (
                <EventDetail data = {row.original} duplicateMessage = {donationDuplicateMessage} borderColor = {this.getRowColor(row)}/>
              )}/>
          </div>
          <div className = "column">
            <ReactTable
              data = {this.state.deposits}
              columns = {depositColumns}
              className = "-striped"
              showPagination = {false}
              sortable = {true}
              filterable = {true}
              pageSize = {this.state.deposits.length}
              getTrProps = {this.getTrProps}
              defaultSorted = {[
                {
                  id: 'block',
                  desc: true
                }
              ]}
              SubComponent = {row => (
                <EventDetail data = {row.original} duplicateMessage = {depositDuplicateMessage} borderColor = {this.getRowColor(row)}/>
              )}/>
          </div>
        </div>
      </div>
    );
  }

}

export default HomeToForeign;
