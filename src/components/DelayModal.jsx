import React from 'react'

import Modal from 'react-modal';

import Web3Button from './Web3Button';
import config from '../configuration';

const style = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  };
   

class DelayModal extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        seconds: 60
      }
    }

    handleChange(evt) {
        const seconds = (evt.target.validity.valid) ? evt.target.value : this.state.seconds;
        this.setState({ seconds });
      }

      render(){
        return (
            <Modal
                isOpen={this.props.delayId !== -1}
                contentLabel="Delay"
                style={style}>
                <div>Please enter the delay in seconds.</div>
                <input type="number" onInput={this.handleChange.bind(this)} value={this.state.seconds} />
                <Web3Button onClick={(context) => {
                    let contract = config.getContract(context);
                    if (contract) {
                        contract.methods.delayPayment(this.props.delayId, this.state.seconds).send({ from: context.account })
                    }
                    this.props.handleClose();
                }} text="Submit" />
                <button onClick={this.props.handleClose}>Cancel</button>
            </Modal>
        );
      }
}

export default DelayModal;