import React, { Component } from "react";
import feathers from "@feathersjs/client";
import io from "socket.io-client";
import config from "../configuration";

const client = feathers();
client.configure(feathers.socketio(io(config.feathersDappConnection)));

class DonationLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donationUrl: "#"
    };

    client
      .service("donations")
      .find({
        query: {
          txHash: props.txHash,
          //status: "Committed"
        }
      })
      .then(donationResp => {
        //console.log(donationResp);
        //console.log(donationResp.data.length);
        const dataArrayNum = donationResp.data.length - 1;
        if (donationResp.data[dataArrayNum].ownerType === "milestone") {
          client
            .service("milestones")
            .find({
              query: {
                _id: donationResp.data[dataArrayNum].ownerTypeId
              }
            })
            .then(milestoneResp => {
              const milestone = milestoneResp.data[0];
              this.setState({
                donationType: 'Milestone ',
                donationUrl: `${config.actualDappURL}campaigns/${
                  milestone.campaignId
                }/milestones/${milestone._id}`
              });
            });
        } else if (donationResp.data[dataArrayNum].ownerType === "campaign") {
          this.setState({
            donationType: 'Campaign ',
            donationUrl: `${config.actualDappURL}campaigns/${
              donationResp.data[dataArrayNum].ownerTypeId
            }`
          },()=>{
            //console.log(this.state.donationUrl);
          });
        } else {
          this.setState({
            donationType: 'Incomplete ',
            donationUrl: `${config.feathersDappConnection}donations/?$sort%5BupdatedAt%5D=-1&txHash=${props.txHash}`
          });
        }
      });
  }

  render() {
    if (this.state.donationUrl !== '#') {
      return (
        <span className = "event-name">
        <a target="_blank" href={this.state.donationUrl}>
          {this.state.donationType}Donation Link
        </a></span>
      );
    } else {
      return null;
    }
  }
}



export default DonationLink;

