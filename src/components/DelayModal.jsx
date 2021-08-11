import React from 'react';

import Modal from 'react-modal';

import Web3Button from './Web3Button';
import config from '../configuration';
import { sendTx } from '../eip1559';

const style = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

class DelayModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 60,
    };
  }

  handleChange(evt) {
    this.setState(prevState => {
      const seconds = evt.target.validity.valid ? evt.target.value : prevState.seconds;
      return { seconds };
    });
  }

  render() {
    return (
      <Modal isOpen={this.props.delayId !== -1} contentLabel="Delay" style={style}>
        <div>Please enter the delay in seconds.</div>
        <input type="number" onInput={this.handleChange.bind(this)} value={this.state.seconds} />
        <Web3Button
          onClick={context => {
            const contract = config.getContract(context);
            if (contract) {
              sendTx(
                context,
                contract.methods.delayPayment(this.props.delayId, this.state.seconds),
              );
            }
            this.props.handleClose();
          }}
          text="Submit"
        />
        {/* eslint-disable-next-line react/button-has-type */}
        <button onClick={this.props.handleClose}>Cancel</button>
      </Modal>
    );
  }
}

export default DelayModal;
