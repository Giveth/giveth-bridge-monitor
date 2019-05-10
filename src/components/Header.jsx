import React, { useEffect }  from 'react'
import { useWeb3Context } from 'web3-react'

import Web3Button from './Web3Button';

export default function Header() {
  const networks = ["Mainnet", "Ropsten", "Kovan", "Rinkeby"]
  const context = useWeb3Context()
  useEffect(() => {
    context.setFirstValidConnector(['MetaMask'])
  }, [])

  return (
    <div className="header-box">
      <p>
          <span className="header-title-text">
            <img src="https://bowensanders.github.io/giveth-logo-black.png" className="logo" alt="" height="14" width="14" ></img>
            Giveth Bridge Dashboard 
          </span>
          <span className="header-right-align">
            
              <Web3Button show={() => !context.account} onClick={() => context.setFirstValidConnector(['MetaMask'])} text="Connect with metamask" />
            
            {context.account} {networks[context.networkId-1]}
          </span>
      </p>
    </div>
  );
}