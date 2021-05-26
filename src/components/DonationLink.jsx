import React, { Component } from 'react';
import feathers from '@feathersjs/client';
import io from 'socket.io-client';
import config from '../configuration';

const client = feathers();
client.configure(
  feathers.socketio(io(config.feathersDappConnection), {
    transports: ['websocket'],
  }),
);

class DonationLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donationUrl: '#',
    };

    client
      .service('donations')
      .find({
        query: {
          txHash: props.txHash,
        },
      })
      .then(donationResp => {
        const dataArrayNum = donationResp.data.length - 1;
        if (dataArrayNum >= 0) {
          if (donationResp.data[dataArrayNum].ownerType === 'milestone') {
            client
              .service('milestones')
              .find({
                query: {
                  _id: donationResp.data[dataArrayNum].ownerTypeId,
                },
              })
              .then(milestoneResp => {
                const milestone = milestoneResp.data[0];
                this.setState({
                  donationType: 'Milestone ',
                  donationUrl: `${config.actualDappURL}campaigns/${milestone.campaignId}/milestones/${milestone._id}`,
                });
              });
          } else if (donationResp.data[dataArrayNum].ownerType === 'campaign') {
            this.setState(
              {
                donationType: 'Campaign ',
                donationUrl: `${config.actualDappURL}campaigns/${donationResp.data[dataArrayNum].ownerTypeId}`,
              },
              () => {},
            );
          } else if (donationResp.data[dataArrayNum].delegateType === 'dac') {
            this.setState({
              donationType: 'DAC ',
              donationUrl: `${config.actualDappURL}dacs/${donationResp.data[dataArrayNum].delegateTypeId}`,
            });
          } else {
            this.setState({
              donationType: 'Incomplete ',
              donationUrl: `${config.feathersDappConnection}donations/?$sort%5BupdatedAt%5D=-1&txHash=${props.txHash}`,
            });
          }
        }
      });
  }

  render() {
    if (this.state.donationUrl !== '#') {
      return (
        <span className="event-name">
          <a target="_blank" rel="noopener noreferrer" href={this.state.donationUrl}>
            {this.state.donationType}Donation Link
          </a>
        </span>
      );
    }
    return null;
  }
}

export default DonationLink;
