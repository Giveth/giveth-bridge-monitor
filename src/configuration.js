const {
  REACT_APP_ENVIRONMENT = 'localhost', // optional
  REACT_APP_FEATHERJS_CONNECTION_URL,
} = process.env;

const configurations = {
  localhost: {
    title: 'localhost',
    feathersConnection: 'http://localhost:3030',
  },
  testnet: {
    title: 'testnet',
    feathersConnection: 'https://feathers.bridge.giveth.io/',
    homeEtherscanURL: 'https://ropsten.etherscan.io/',
    foreignEtherscanURL: 'https://rinkeby.etherscan.io/',
  }
  // mainnet: {
  //   title: 'mainnet',
  //   feathersConnection: 'https://feathers.mainnet.giveth.io',
  // },
};

// Create config object based on environment setup
const config = Object.assign({}, configurations[REACT_APP_ENVIRONMENT]);


config.feathersConnection = REACT_APP_FEATHERJS_CONNECTION_URL || config.feathersConnection;

export default config;
