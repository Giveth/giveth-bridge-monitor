import React, {Component} from 'react';
import ReactTable from 'react-table';

// import 'react-table/react-table.css';
// import "../styles/styles.css";

class EventDetail extends Component{

  renderReturnTable() {
    const data = this.props.data;
    const returnValues = data.event.returnValues;

    const returnKeys = Object.keys(returnValues).filter(key => isNaN(parseInt(key, 10)));

    const returnValuesData = returnKeys.map((key) => {
      const value = returnValues[key];
      return ({
        key,
        value
      });
    });

    const returnValuesColumns = [{
      Header: 'Return Values',
      headerClassName: 'returnValues',
      columns: [{
        Header: 'Key',
        accessor: 'key'
      },{
        Header: 'Value',
        accessor: 'value'
      }]
    }];

    const style = {
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'rgba(160, 160, 160, 0.7)',
      borderRadius: '5px'
    }

    return (
      <div className = "event-subcontainer" style = {style}>
        <span className = "event-name">- {this.props.data.event.event} Event -</span>
        <ReactTable
          data = {returnValuesData}
          columns = {returnValuesColumns}
          showPagination = {false}
          sortable = {false}
          pageSize = {returnValuesData.length}
        />
      </div>
    )
  }
  renderDuplicateError(){

    const duplicateMessage = this.props.duplicateMessage;

    // const data = this.props.data.matches;
    //
    // const columns = [{
    //   Header: "Duplicates",
    //   headerClassName: "duplicates",
    //   columns: [{
    //     Header: "Hash",
    //     accessor: 'hash'
    //   }, {
    //     Header: "ID",
    //     accessor: "id"
    //   }]
    // }]

    const style = {
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: this.props.borderColor,
      borderRadius: '5px'
    }

    return(
      <div className = "event-subcontainer" style = {style}>
        <span className = "error-warning" style = {{marginBottom: '0'}}> {duplicateMessage} </span>
      </div>
    )
  }
  renderUnmatchedError(){

    const style = {
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: this.props.borderColor,
      borderRadius: '5px'
    }

    return(
      <div className = "event-subcontainer" style = {style}>
        <span className = "error-warning" style = {{marginBottom: '0'}}> This event has no matching event across the bridge! </span>
      </div>
    )
  }
  render(){
    const matched = this.props.data.matched;
    const duplicated = this.props.data.hasDuplicates;
    const style = {
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: this.props.borderColor,
    }
    return (
      <div style = {style}>
        {this.renderReturnTable()}
        {duplicated ? this.renderDuplicateError(): ''}
        {!matched ? this.renderUnmatchedError(): ''}
      </div>
    )
  }
}

export default EventDetail;
