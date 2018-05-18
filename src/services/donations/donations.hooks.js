

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
      // async (context) => {
      //   const app = context.app;
      //   const donation = context.result;
      //
      //   const txHash = donation.event.transactionHash;
      //
      //   const deposits = await app.service('deposits').find({
      //     query: {
      //       'event.returnValues.homeTx': txHash,
      //     }
      //   });
      //
      //   if (deposits.total === 0) return context;
      //   if (deposits.total === 1) {
      //
      //     const donation_id = donation._id;
      //     const deposit_id = deposits.data[0]._id;
      //     const hash = deposits.data[0].event.transactionHash;
      //
      //     app.service('donations').patch(donation_id, {
      //       $push: {matches: {
      //         hash,
      //         id: deposit_id,
      //       }},
      //       matched: true,
      //     });
      //
      //     return context;
      //   }
      //   if (deposits.total > 1) {
      //
      //     const duplicates = deposits.data.map((duplicate) => {
      //       app.service
      //       return({
      //         hash: duplicate.event.transactionHash,
      //         id: duplicate._id,
      //       });
      //     });
      //
      //     app.service('donations').patch(donation._id, {
      //       matched: true,
      //       matches: duplicates,
      //       hasDuplicates: true,
      //     });
      //
      //     return context;
      //   }
      // }
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
