const {
  REACT_APP_ENVIRONMENT = 'beta', // optional
  REACT_APP_FEATHERJS_CONNECTION_URL,
} = process.env;

const configurations = {
  localhost: {
    title: 'localhost',
    feathersConnection: 'http://localhost:3030',
    feathersDappConnection: 'https://localhost:3030',
  },
  develop: {
    title: 'develop',
    feathersConnection: 'https://feathers.bridge.develop.giveth.io/',
    feathersDappConnection: 'https://feathers.develop.giveth.io/',
    homeEtherscanURL: 'https://ropsten.etherscan.io/',
    foreignEtherscanURL: 'https://rinkeby.etherscan.io/',
    actualDappURL: 'https://develop.giveth.io/',
  },
  release: {
    title: 'release',
    feathersConnection: 'https://feathers.bridge.release.giveth.io/',
    feathersDappConnection: 'https://feathers.release.giveth.io/',
    homeEtherscanURL: 'https://ropsten.etherscan.io/',
    foreignEtherscanURL: 'https://rinkeby.etherscan.io/',
    actualDappURL: 'https://release.giveth.io/',
  },
  beta: {
    title: 'beta',
    feathersConnection: 'https://feathers.bridge.beta.giveth.io/',
    feathersDappConnection: 'https://feathers.beta.giveth.io/',
    homeEtherscanURL: 'https://etherscan.io/',
    foreignEtherscanURL: 'https://rinkeby.etherscan.io/',
    actualDappURL: 'https://beta.giveth.io/',
  },
  // mainnet: {
  //   title: 'mainnet',
  //   feathersConnection: 'https://feathers.mainnet.giveth.io',
  // },
};

// Create config object based on environment setup
const config = Object.assign({}, configurations[REACT_APP_ENVIRONMENT]);


config.feathersConnection = REACT_APP_FEATHERJS_CONNECTION_URL || config.feathersConnection;

export default config;
