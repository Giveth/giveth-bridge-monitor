import React, {Component} from 'react';
import '../styles/styles.css';

class ForeignToHome extends Component{

  constructor(props){
    super(props);
    this.state = {
      withdrawals: [],
      payments: [],
    }
    this.loadEvents()
  }
  loadEvents = async () => {
    const client = this.props.client;
    client.service('withdrawals').find().then((withdrawals) => this.setState({withdrawals: withdrawals.data}));
    client.service('payments').find().then((payments) => this.setState({payments: payments.data}));
  }

  render() {
    return(
      <div>
        <div className = "flex_container">
          <div className = "column">
            <h5> Withdrawals </h5>
            <ul>
              {this.state.withdrawals.map((withdrawal) => <li key = {withdrawal._id}>{withdrawal.return.returnValues.amount}</li>)}
            </ul>
          </div>
          <div className = "column">
            <h5> Authorized Payments </h5>
            <ul>
              {this.state.payments.map((payment, idx) => <li key = {payment._id}>{payment.return.returnValues.amount}</li>)}
            </ul>
          </div>
        </div>

      </div>
    );
  }

}

export default ForeignToHome;
