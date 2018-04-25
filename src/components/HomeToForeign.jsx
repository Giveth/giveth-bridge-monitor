import React, {Component} from 'react';
import "../styles/styles.css";

class HomeToForeign extends Component{

  constructor(props){
    super(props);
    this.state = {
      donations: [],
      giverCreationDonations: [],
      deposits: [],
    };
    this.findContracts();
  }

  findContracts = async () => {
    const homeContract = this.props.data.homeContract;
    const foreignContract = this.props.data.foreignContract;
    const range = this.props.data.blockRange;
    const promises = [
      homeContract.getPastEvents('Donate', range),
      homeContract.getPastEvents('DonateAndCreateGiver', range),
      foreignContract.getPastEvents('Deposit', range)
    ];
    Promise.all(promises).then(
      ([donations,
        giverCreationDonations,
        deposits]) => {this.setState({
          donations,
          giverCreationDonations,
          deposits,
        });
      }
    );
  }

  render() {

    return(
      <div>
        <div className = "flex_container">
          <div className = "column">
            <h5> Donations </h5>
            <ul>
              {this.state.donations.map((donation, idx) => <li key = {idx}>{donation.returnValues.amount}</li>)}
            </ul>
            <h5> Giver Creation Donations </h5>
            <ul>
              {this.state.giverCreationDonations.map((donation, idx) => <li key = {idx}>{donation.returnValues.amount}</li>)}
            </ul>
          </div>
          <div className = "column">
            <h5> Deposits </h5>
            <ul>
              {this.state.deposits.map((deposit, idx) => <li key = {idx}>{deposit.returnValues.amount}</li>)}
            </ul>
          </div>
        </div>

      </div>
    );
  }

}

export default HomeToForeign;
