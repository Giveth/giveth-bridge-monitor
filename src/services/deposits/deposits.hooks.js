

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context) => {

      const deposit = context.data;
      const homeTxHash = deposit.event.returnValues.homeTx;

      // find referenced donation
      const donations = await context.app.service('donations').find({
        query: {
          'event.transactionHash': homeTxHash,
        }
      });

      // if no donations are found, bail
      if (donations.total === 0) return context;

      const donation = donations.data[0];
      const deposit_id = deposit._id;
      const donation_id = donation._id;

      // if the donation has already been matched, it now has duplicate references
      const hasDuplicates = donation.matched;

      context.data.matched = true;
      context.data.hasDuplicates = hasDuplicates;

      // find the previously matched deposits and add this one to the matches
      // match.patch tells the donation (in it's before patch hook) if the deposit needs to be flagged as a duplicate, since the first deposit added to the matches doesn't know if it will be a duplicate until another is added
      const previousMatches = donation.matches;
      const matches = previousMatches.concat({
        hash: deposit.event.transactionHash,
        patch: !hasDuplicates,
      });

      await context.app.service('donations').patch(donation_id, {
        matches,
        matched: true,
        hasDuplicates,
      });

      return context;
    }
    ],
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
