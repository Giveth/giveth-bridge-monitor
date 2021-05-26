const Web3 = require('web3');
const asyncForEach = require('../../lib/helpers/asyncForEach');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [
      async context => {
        const homeNodeURL = context.app.get('homeNodeURL');
        const homeWeb3 = new Web3(homeNodeURL);
        // Update the balance of each spender and pass it along with the record
        await asyncForEach(context.result.data, async record => {
          const address = record.event.returnValues.spender;
          if (!address || address === 'undefined') {
            return context;
          }
          const balance = await homeWeb3.eth.getBalance(address);
          record.balance = homeWeb3.utils.fromWei(balance);
        });

        return context;
      },
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
