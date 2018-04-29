import React, {Component} from 'react';
import "../styles/styles.css";

class HomeToForeign extends Component{

  constructor(props){
    super(props);
    this.state = {
      donations: [],
      deposits: [],
    }
    this.loadEvents()
  }
  loadEvents = async () => {
    const client = this.props.client;
    client.service('donations').find().then((donations) => this.setState({donations: donations.data}));
    client.service('deposits').find().then((deposits) => this.setState({deposits: deposits.data}));
  }
  render() {
    return(
      <div>
        <div className = "flex_container">
          <div className = "column">
            <h5> Donations </h5>
            <ul>
              {this.state.donations.map((donation) => <li key = {donation._id}>{
                 donation.return.returnValues.amount + (donation.giverCreation ? " (Giver Created)" : "")
              }</li>)}
            </ul>
          </div>
          <div className = "column">
            <h5> Deposits </h5>
            <ul>
              {this.state.deposits.map((deposit, idx) => <li key = {deposit._id}>{deposit.return.returnValues.amount}</li>)}
            </ul>
          </div>
        </div>

      </div>
    );
  }

}

export default HomeToForeign;
