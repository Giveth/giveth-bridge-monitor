

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [async (context) => {

      const hash = context.data.event.transactionHash;

      const deposits = await context.app.service('deposits').find({
        query: {
          'event.returnValues.homeTx': hash,
        }
      });

      if (deposits.total === 0) return context;
      const hasDuplicates = (deposits.total > 1);

      deposits.data.map((deposit) => {
        const match = {
          hash: deposit.event.transactionHash,
          patch: !hasDuplicates,
        };
        context.data.matches.push(match);
        context.data.matched = true;
        context.data.hasDuplicates = hasDuplicates;
        context.app.service('deposits').patch(deposit._id, {
          matched: true,
          hasDuplicates,
        });
      });

      return context;
    }],
    update: [],
    patch: [
      async (context) => {


        const hasDuplicates = context.data.hasDuplicates;
        // if the donation doesn't have any duplicates nothing needs to be done here
        if (!hasDuplicates) return context;

        const matches = context.data.matches;
        let depositToPatch;
        let index;
        // find any deposits that aren't already flagged as duplicates
        // (there SHOULD only be one, and it SHOULD be the first, but this is a safeguard)

        for (let i = 0; i < matches.length; i++){
          if (matches[i].patch) {
            depositToPatch = matches[i].hash;
            index = i;
            break;
          }
        }
        // none of the matches need to patched, so bail
        if (!depositToPatch) return context;

        await context.app.service('deposits').patch(depositToPatch, {
          hasDuplicates: true,
        });
        context.data.matches[index].patch = false;


        return context;

      }
    ],
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
