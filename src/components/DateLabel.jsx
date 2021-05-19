import React from 'react';

const moment = require('moment-timezone');

class DateLabel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTimeLeft: false,
    };
  }

  render() {
    if (this.props.date) {
      const timezone = moment.tz.guess();
      const date = moment.tz(this.props.date, 'UTC').tz(timezone);
      return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <span
          onClick={() => {
            this.setState(prevState => ({ showTimeLeft: !prevState.showTimeLeft }));
          }}
        >
          {this.state.showTimeLeft ? date.fromNow() : date.format('ddd, D MMM YYYY HH:mm:ss z')}
        </span>
      );
    }
    return <span>Invalid Date</span>;
  }
}

export default DateLabel;
