import React from 'react';

import { useWeb3Context } from 'web3-react';

export default function Web3Button(props) {
  const context = useWeb3Context();
  if (!props.show || props.show(context)) {
    return (
      // eslint-disable-next-line react/button-has-type
      <button className="btn" onClick={() => props.onClick(context)}>
        {props.text}
      </button>
    );
  }
  return null;
}
