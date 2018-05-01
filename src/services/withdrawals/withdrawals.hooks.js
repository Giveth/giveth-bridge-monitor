

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
        const withdrawal = context.result;
        if (withdrawal.matched) return context;

        const transactionHash = withdrawal.event.transactionHash;

        const payment = await context.app.service('payments').find({
          query: {
            'event.returnValues.reference': transactionHash,
          }
        });

        if (payment.total === 0) return context;

        const withdrawal_id = withdrawal._id;
        const payment_id = payment.data[0]._id;

        context.app.service('withdrawals').patch(withdrawal_id, {
          payment_id,
          matched: true,
        });

        context.app.service('payments').patch(payment_id, {
          withdrawal_id,
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
