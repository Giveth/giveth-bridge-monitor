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
          if (donationResp.data[dataArrayNum].ownerType === 'trace') {
            client
              .service('traces')
              .find({
                query: {
                  _id: donationResp.data[dataArrayNum].ownerTypeId,
                },
              })
              .then(traceResp => {
                const trace = traceResp.data[0];
                this.setState({
                  donationType: 'Trace ',
                  donationUrl: `${config.actualDappURL}trace/${trace.slug}`,
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
          } else if (donationResp.data[dataArrayNum].delegateType === 'community') {
            this.setState({
              donationType: 'Community ',
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
