import React, {Component} from 'react';
import ReactTable from 'react-table';

class Info extends Component{
  constructor(props){
    super(props);
    this.state = {
      spenders: [],
      owner: [],
    }
    this.loadEvents();
  }

  loadEvents = async () => {
    const client = this.props.client;
    client.service('spenders').find().then((spenders) => {
      this.setState({
        spenders: spenders.data,
      });
    });
    client.service('owners').get(1).then((owner) => {
      this.setState({
        owner: owner,
      });
    });

  }
  getRowColor = (row) => {
    let color;
    if (row.original.balance < 2) {
      color = 'rgba(176, 0, 0, 0.5)';
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
  render(){
    const spenderColumns = [{
      Header: "Authorized Spenders",
      headerClassName: "spenders",
      columns: [{
        Header: 'Address',
        id: 'address',
        accessor: datum => datum.event.returnValues.spender
      }, {
        Header: 'Balance (ETH)',
        accessor: 'balance'
      }]
    }];
    const ownerColumns = [{
      Header: "Foreign Bridge Owner",
      headerClassName: "owner",
      columns: [{
        Header: 'Address',
        id: 'address',
        accessor: datum => datum.address
      }, {
        Header: 'Balance (ETH)',
        accessor: 'balance'
      }]
    }];
    return(
      <div>
        <div className = "flex_container">
          <div className = "column">
            <ReactTable
              data = {this.state.spenders}
              columns = {spenderColumns}
              className = "-striped"
              getTrProps = {this.getTrProps}
              showPagination = {false}
              sortable = {true}
              filterable = {true}
              pageSize = {this.state.spenders.length} />
          </div>
          <div className = "column">
            <ReactTable
              data = {[this.state.owner]}
              columns = {ownerColumns}
              className = "-striped"
              getTrProps = {this.getTrProps}
              showPagination = {false}
              sortable = {true}
              filterable = {true}
              pageSize = '1' />
          </div>
        </div>
      </div>
    )
  }
}

export default Info;
