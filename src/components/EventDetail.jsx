import React, {Component} from 'react';
import ReactTable from 'react-table';

// import 'react-table/react-table.css';
// import "../styles/styles.css";

class EventDetail extends Component{

  render(){
    const data = this.props.data;
    const eventName = data.event.event;
    const returnValues = data.event.returnValues;

    const returnKeys = Object.keys(returnValues).filter(key => isNaN(parseInt(key, 10)));

    const tableData = returnKeys.map((key) => {
      const value = returnValues[key];
      return ({
        key,
        value
      });
    });

    const columns = [{
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

    return (
      <div className ="event-container">
        <span className = "event-name">- {eventName} Event -</span>
        <ReactTable
          data = {tableData}
          columns = {columns}
          showPagination = {false}
          pageSize = {tableData.length}
        />
      </div>
    )
  }
}

export default EventDetail;
