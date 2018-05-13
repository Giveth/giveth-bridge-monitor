import React, {Component} from 'react';
import ReactTable from 'react-table';

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

  render() {
    const donationColumns = [
      {
        Header: 'Donations',
        headerClassName: 'donations',
        columns: [{
          id: 'hashes',
          Header: 'Hash',
          accessor: datum => datum.event.transactionHash
        },
        {
          id: 'amount',
          Header: 'Amount',
          accessor: datum => datum.event.returnValues.amount
        },
        {
          id: 'matched',
          Header: 'Matched',
          accessor: datum => datum.matched ? "good" : "bad"
        }]
      }
    ];
    const depositColumns = [
      {
        Header: 'Deposits',
        headerClassName: 'deposits',
        columns: [{
          id: 'hashes',
          Header: 'Hash',
          accessor: datum => datum.event.transactionHash
        },
        {
          id: 'amount',
          Header: 'Amount',
          accessor: datum => datum.event.returnValues.amount
        },
        {
          id: 'matched',
          Header: 'Matched',
          accessor: datum => datum.matched ? "good" : "bad",
        }]
      }
    ];
    const tableStyle = {
      width: '90%',
    }
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
              style = {tableStyle}
              pageSize = {this.state.donations.length}
              SubComponent = {row => (
                <h5> [Any event related info could be put here]</h5>
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
              style = {tableStyle}
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
