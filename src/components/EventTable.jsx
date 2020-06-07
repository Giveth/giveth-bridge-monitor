import React, { Component} from 'react';
import ReactTable from 'react-table';
import EventDetail from './EventDetail';
import Web3 from 'web3';

class EventTable extends Component {

  componentDidMount() {
    this.page = 0;
    this.pageSize = 10;
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

  render(){
    const columns = [
      {
        Header: this.props.header,
        headerClassName: 'hc',
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
            accessor: datum => Number(datum.event.blockNumber)
          }]
      }
    ];

    return(
      <ReactTable
        data = {this.props.events}
        columns = {columns}
        sortable = {true}
        filterable = {true}
        getTrProps = {this.getTrProps}
        collapseOnDataChange = {false}
        defaultSorted = {[
          {
            id: 'block',
            desc: true
          }
        ]}
        showPagination={true}
        showPaginationBottom={true}
        defaultPageSize={10}
        onPageChange={page => {
          if (page > this.page) {
            this.props.fetch(page, this.pageSize);
          }
          this.page = page;
        }}
        onPageSizeChange={pageSize => {
          if (pageSize > this.pageSize) {
            this.props.fetch(this.page, pageSize);
          }
          this.pageSize = pageSize;
        }}
        SubComponent = {row => (
          <EventDetail
            data = {row.original}
            duplicateTable = {this.props.duplicateTable}
            duplicateMessage = {this.props.duplicateMessage}
            borderColor = {this.getRowColor(row)}
            etherscanURL = {this.props.etherscanURL}
          />
        )}
      />
    )
  }
}

export default EventTable;
