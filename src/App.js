/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import Web3Provider, { Connectors } from 'web3-react';
import Web3 from 'web3';

import BridgeMonitor from './components/BridgeMonitor';
import 'react-tabs/style/react-tabs.css';
import './styles/styles.css';
import 'react-table/react-table.css';

const { InjectedConnector } = Connectors;

const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4] });

const connectors = { MetaMask };

function App() {
  return (
    <Web3Provider connectors={connectors} libraryName="web3.js" web3Api={Web3}>
      <BridgeMonitor />
    </Web3Provider>
  );
}

export default App;
