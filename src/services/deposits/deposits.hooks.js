

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
      //   const deposit = context.result;
      //
      //   const homeTxHash = deposit.event.returnValues.homeTx;
      //
      //   const donations = await context.app.service('donations').find({
      //     query: {
      //       'event.transactionHash': homeTxHash,
      //     }
      //   });
      //
      //   if (donation.total === 0) return context;
      //
      //   const deposit_id = deposit._id;
      //   const donation_id = donation.data[0]._id;
      //
      //   context.app.service('deposits').patch(deposit_id, {
      //     donation_id,
      //     matched: true,
      //   });
      //
      //   context.app.service('donations').patch(donation_id, {
      //     deposit_id,
      //     matched: true
      //   });
      //
      //   return context;
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
