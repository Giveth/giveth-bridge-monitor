import React, {Component} from 'react';
import '../styles/styles.css';

class ForeignToHome extends Component{

  constructor(props){
    super(props);
    this.state = {
      withdrawals: [],
      authorizedPayments: [],
    };
    this.findContracts();
  }

  findContracts = async () => {
    const homeContract = this.props.data.homeContract;
    const foreignContract = this.props.data.foreignContract;
    const range = this.props.data.blockRange;
    const promises = [
      foreignContract.getPastEvents('Withdraw', range),
      homeContract.getPastEvents('PaymentAuthorized', range),
    ];
    Promise.all(promises).then(
      ([withdrawals,
        authorizedPayments]) => {this.setState({
          withdrawals,
          authorizedPayments
        });
      }
    );
  }

  render() {

    return(
      <div className = "flex_container">
        <div className = "column">
          <h5> Withdrawals </h5>
          <ul>
            {this.state.withdrawals.map((withdrawal, idx) => <li key = {idx}>{withdrawal.returnValues.amount}</li>)}
          </ul>
        </div>
        <div className = "column">
          <h5> Authorized Payments </h5>
          <ul>
            {this.state.authorizedPayments.map((payment, idx) => <li key = {idx}>{payment.returnValues.amount}</li>)}
          </ul>
        </div>
      </div>


    );
  }

}

export default ForeignToHome;
