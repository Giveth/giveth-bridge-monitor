

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context) => {

        const hash = context.data.event.transactionHash;

        const payments = await context.app.service('payments').find({
          query: {
            'event.returnValues.reference': hash,
            'event.returnValues.recipient': context.data.event.returnValues.recipient,
            'event.returnValues.token': context.data.event.returnValues.token,
            'event.returnValues.amount': context.data.event.returnValues.amount,
          }
        });

        if (payments.total === 0) return context;
        const hasDuplicates = (payments.total > 1);

        payments.data.map((payment) => {
          const match = {
            hash: payment.event.transactionHash,
            patch: !hasDuplicates,
          };
          context.data.matches.push(match);
          context.data.matched = true;
          context.data.hasDuplicates = hasDuplicates;
          context.app.service('payments').patch(payment._id, {
            matched: true,
            hasDuplicates,
          });
        });

        return context;
      }
    ],
    update: [],
    patch: [
      async (context) => {


        const hasDuplicates = context.data.hasDuplicates;
        // if the withdrawal doesn't have any duplicates nothing needs to be done here
        if (!hasDuplicates) return context;

        const matches = context.data.matches;
        let paymentToPatch;
        let index;
        // find any payments that aren't already flagged as duplicates
        // (there SHOULD only be one, and it SHOULD be the first, but this is a safeguard)
        for (let i = 0; i < matches.length; i++){
          if (matches[i].patch) {
            paymentToPatch = matches[i]._id;
            index = i;
            break;
          }
        }
        // none of the matches need to patched, so bail
        if (!paymentToPatch) return context;

        await context.app.service('payments').patch(paymentToPatch, {
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
      //   const withdrawal = context.result;
      //   if (withdrawal.matched) return context;
      //
      //   const transactionHash = withdrawal.event.transactionHash;
      //
      //   const payment = await context.app.service('payments').find({
      //     query: {
      //       'event.returnValues.reference': transactionHash,
      //     }
      //   });
      //
      //   if (payment.total === 0) return context;
      //
      //   const withdrawal_id = withdrawal._id;
      //   const payment_id = payment.data[0]._id;
      //
      //   context.app.service('withdrawals').patch(withdrawal_id, {
      //     payment_id,
      //     matched: true,
      //   });
      //
      //   context.app.service('payments').patch(payment_id, {
      //     withdrawal_id,
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
