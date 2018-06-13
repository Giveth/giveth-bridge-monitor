

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context) => {

      const payment = context.data;
      const reference = payment.event.returnValues.reference;

      // find referenced withdrawal
      // TODO: this could probably be done with get(reference), since the hashes are used as the ids, but it might need a try/catch
      const withdrawals = await context.app.service('withdrawals').find({
        query: {
          'event.transactionHash': reference,
        }
      });

      // if no withdrawals are found, bail
      if (withdrawals.total === 0) return context;

      const withdrawal = withdrawals.data[0];
      const withdrawal_id = withdrawal._id;

      // if the withdrawal has already been matched, it now has duplicate references
      const hasDuplicates = withdrawal.matched;

      context.data.matched = true;
      context.data.hasDuplicates = hasDuplicates;

      // find the previously matched payments and add this one to the matches
      // match.patch tells the withdrawal (in it's before patch hook) if the payment needs to be flagged as a duplicate, since the first payment added to the matches doesn't know if it will be a duplicate until another is added
      const previousMatches = withdrawal.matches;
      const matches = previousMatches.concat({
        hash: payment.event.transactionHash,
        patch: !hasDuplicates,
      });

      await context.app.service('withdrawals').patch(withdrawal_id, {
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
    create: [
      // async (context) => {
      //   const payment = context.result;
      //   if (payment.matched) return context;
      //
      //   const reference = payment.event.returnValues.reference;
      //
      //   const withdrawal = await context.app.service('withdrawals').find({
      //     query: {
      //       'event.transactionHash': reference,
      //     }
      //   });
      //
      //   if (withdrawal.total === 0) return context;
      //
      //   const payment_id = payment._id;
      //   const withdrawal_id = withdrawal.data[0]._id;
      //
      //   context.app.service('payments').patch(payment_id, {
      //     withdrawal_id,
      //     matched: true,
      //   });
      //
      //   context.app.service('withdrawals').patch(withdrawal_id, {
      //     payment_id,
      //     matched: true,
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
