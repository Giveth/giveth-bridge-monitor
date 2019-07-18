import React from 'react'

var moment = require('moment-timezone');

class DateLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showTimeLeft: false
        }
    }

    render() {
        const timezone = moment.tz.guess();
        const date = moment.tz(this.props.date, "UTC").tz(timezone);
        return (<span onClick={() => { this.setState(prevState => ({ showTimeLeft: !prevState.showTimeLeft })) }}>{this.state.showTimeLeft ? (date.fromNow()) : (date.format("ddd, D MMM YYYY HH:mm:ss z"))}</span>)
    }
}

export default DateLabel;