

module.exports = {
  before: {
    all: [],
    find: [],
    get: [(context) => {
      context.result = {
        homeContract: context.app.get('homeContractAddress'),
        foreignContract: context.app.get('foreignContractAddress')
      };

      return context;
    }],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
