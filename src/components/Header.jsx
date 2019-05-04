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
    <div class="header-box">
      <p>
          <span class="header-title-text">
            <img src="https://bowensanders.github.io/giveth-logo-black.png" class="logo" alt="" height="14" width="14" ></img>
            Giveth Bridge Dashboard 
          </span>
          <span class="header-right-align">
            <span class="button-pad">
              <Web3Button show={() => !context.account} onClick={() => context.setFirstValidConnector(['MetaMask'])} text="Connect with metamask" />
            </span>
            {context.account} {networks[context.networkId-1]}
          </span>
      </p>
    </div>
  );
}