

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context) => {
        const donation = context.result;
        if (donation.matched) return context;

        const txHash = donation.event.transactionHash;

        const deposit = await context.app.service('deposits').find({
          query: {
            'event.returnValues.homeTx': txHash,
          }
        });
        
        if (deposit.total === 0) return context;

        const donation_id = donation._id;
        const deposit_id = deposit.data[0]._id;

        context.app.service('donations').patch(donation_id, {
          deposit_id,
          matched: true,
        });

        context.app.service('deposits').patch(deposit_id, {
          donation_id,
          matched: true,
        });

        return context;
      }
    ],
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
