

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
        const payment = context.result;
        if (payment.matched) return context;

        const reference = payment.event.returnValues.reference;

        const withdrawal = await context.app.service('withdrawals').find({
          query: {
            'event.transactionHash': reference,
          }
        });
        
        if (withdrawal.total === 0) return context;

        const payment_id = payment._id;
        const withdrawal_id = withdrawal.data[0]._id;

        context.app.service('payments').patch(payment_id, {
          withdrawal_id,
          matched: true,
        });

        context.app.service('withdrawals').patch(withdrawal_id, {
          payment_id,
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
