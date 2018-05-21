import React, { Component } from 'react';
import BridgeMonitor from './components/BridgeMonitor';

import './styles/styles.css';
import 'react-table/react-table.css';
import 'react-tabs/style/react-tabs.css';

class App extends Component {
  render() {
    return (
      <BridgeMonitor />
    );
  }
}

export default App;
