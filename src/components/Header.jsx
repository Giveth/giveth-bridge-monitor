import React, { useEffect }  from 'react'
import { useWeb3Context } from 'web3-react'

export default function Header() {
  const networks = ["Mainnet", "Ropsten", "Kovan", "Rinkeby"]
  const context = useWeb3Context()
  useEffect(() => {
    context.setFirstValidConnector(['MetaMask'])
  }, [])

  return <div><p>Giveth Bridge Dashboard <button onClick={() => context.setFirstValidConnector(['MetaMask'])}>Connect with metamask</button> {context.account} {networks[context.networkId-1]}</p></div>
}