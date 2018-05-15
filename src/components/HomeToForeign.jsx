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
  getTrProps = (state, rowInfo, instance) => {
    if (rowInfo) {
      return {
        style: {
          background: rowInfo.original.matched? 'rgba(85, 176, 0, 0.5)' : 'rgba(176, 0, 0, 0.5)',
          //border: rowInfo.original.matched? '1px solid green' : '1px solid red',
          color: 'rgba(24, 24, 24, 0.8)'
        }
      }
    }
    return {};
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
            accessor: datum => datum.matched,
            Cell: row => <span> {row.original.matched? '\u2714' : 	'\u2716'} </span>,
            width: 25,
            resizable: false,
            filterable: false,
          },
          {
            id: 'hashes',
            Header: 'Hash',
            accessor: datum => datum.event.transactionHash,
            width: 450
          },
          {
            id: 'amount',
            Header: 'Amount',
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
        columns: [{
          id: 'hashes',
          Header: 'Hash',
          accessor: datum => datum.event.transactionHash
        },
        {
          id: 'amount',
          Header: 'Amount',
          accessor: datum => Web3.utils.fromWei(datum.event.returnValues.amount)
        },
        {
          id: 'matched',
          Header: 'Matched',
          accessor: datum => datum.matched ? "good" : "bad",
        }]
      }
    ];
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
              SubComponent = {row => (
                <EventDetail/>
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
              SubComponent = {row => (
                <h5> [Any event related info could be put here]</h5>
              )}/>
          </div>
        </div>
      </div>
    );
  }

}

export default HomeToForeign;
