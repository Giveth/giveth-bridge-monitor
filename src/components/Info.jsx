import React, { Component } from 'react';
import ReactTable from 'react-table';
import config from '../configuration';

const { foreignEtherscanURL, homeEtherscanURL } = config;

class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spenders: [],
      depositor: {},
    };

    this.loadEvents();
  }

  static getRowColor(row) {
    let color;
    if (row.original.balance < 2) {
      color = 'rgba(176, 0, 0, 0.5)';
    } else {
      color = 'rgba(85, 176, 0, 0.5)';
    }
    return color;
  }

  // eslint-disable-next-line no-unused-vars
  static getTrProps(state, row, instance) {
    if (row) {
      return {
        style: {
          background: Info.getRowColor(row),
          // border: rowInfo.original.matched? '1px solid green' : '1px solid red',
          color: 'rgba(24, 24, 24, 0.8)',
        },
      };
    }
    return {};
  }

  async loadEvents() {
    const { client } = this.props;
    client
      .service('spenders')
      .find()
      .then(spenders => {
        this.setState({
          spenders: spenders.data,
        });
      });
    client
      .service('depositors')
      .find()
      .then(depositor => {
        this.setState({
          depositor,
        });
      });
  }

  render() {
    const spenderColumns = [
      {
        Header: 'Authorized Spenders',
        headerClassName: 'spenders',
        columns: [
          {
            Header: 'Address',
            id: 'address',
            accessor: datum => datum.event.returnValues.spender,
          },
          {
            Header: 'Balance (ETH)',
            accessor: 'balance',
          },
        ],
      },
    ];
    const depositorColumns = [
      {
        Header: 'Foreign Bridge Depositor',
        headerClassName: 'depositor',
        columns: [
          {
            Header: 'Address',
            id: 'address',
            accessor: datum => datum.address,
          },
          {
            Header: 'Balance (ETH)',
            accessor: 'balance',
          },
        ],
      },
    ];
    // https://ropsten.etherscan.io/address/0x0cb06b291c40c76d7bee7c9f1faa4d6a4b338c49
    const homeLink = this.props.contracts
      ? `${homeEtherscanURL}address/${this.props.contracts.homeContract}`
      : null;
    const foreignLink = this.props.contracts
      ? `${foreignEtherscanURL}address/${this.props.contracts.foreignContract}`
      : null;

    return (
      <div>
        <div className="event-subcontainer">
          <span className="event-name">- Contracts -</span>
          <a href={homeLink} target="_blank" rel="noopener noreferrer" className="event-name">
            {' '}
            {config.homeNetworkName} Contract{' '}
          </a>
          <a href={foreignLink} target="_blank" rel="noopener noreferrer" className="event-name">
            {' '}
            {config.foreignNetworkName} Contract{' '}
          </a>
        </div>
        <div className="flex_container">
          <div className="column">
            <ReactTable
              data={this.state.spenders}
              columns={spenderColumns}
              className="-striped"
              getTrProps={Info.getTrProps}
              showPagination={false}
              sortable
              filterable
              pageSize={this.state.spenders.length}
            />
          </div>
          <div className="column">
            <ReactTable
              data={[this.state.depositor]}
              columns={depositorColumns}
              className="-striped"
              getTrProps={Info.getTrProps}
              showPagination={false}
              sortable
              filterable
              pageSize="1"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Info;
