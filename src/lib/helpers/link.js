const app = require('../../app');

async function asyncForEach(array, callback){
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = async (donations, deposits, withdrawals, payments) => {

  await asyncForEach(deposits, async (deposit) => {
    const donationHash = deposit.event.returnValues.homeTx;
    const donations = await app.service('donations').find({
      query: {
        'event.transactionHash' : donationHash,
      }
    });
    if (donations.total === 1) {

      const donation = donations.data[0];

      const hasDuplicates = donation.matched;

      await app.service('donations').patch(donation._id, {
        $push: {
          matches: {
            hash: deposit.event.transactionHash,
            id: deposit._id,
          }
        },
        matched: true,
        hasDuplicates,
      });

      return;
    }
    if (donations.total === 0) {
      return;
    }

    if (donations.total > 1) {
      // TODO: This means multiple donations have the same transactionHash,
      // which should never happen, but it should probably be handled
      return;
    }
  });

  let promises = donations.map((donation) => {
    return app.service('donations').get(donation._id);
  });

  let updatedDonations = await Promise.all(promises);
  let patches = [];

  updatedDonations.map((donation) => {
    let matches = donation.matches;
    if (matches.length === 0) return;

    let hasDuplicates = donation.hasDuplicates;

    matches.map((match) => {
      patches.push(app.service('deposits').patch(match.id, {
        $push: {
          matches: {
            hash: donation.event.transactionHash,
            id: donation._id,
          }
        },
        matched: true,
        hasDuplicates,
      }));
    });
  });

  await asyncForEach(payments, async (payment) => {
    const withdrawalHash = payment.event.returnValues.reference;
    const withdrawals = await app.service('withdrawals').find({
      query: {
        'event.transactionHash': withdrawalHash,
      }
    });

    if (withdrawals.total === 1){

      const withdrawal = withdrawals.data[0];
      const hasDuplicates = withdrawal.matched;

      await app.service('withdrawals').patch(withdrawal._id, {
        $push: {
          matches: {
            hash: payment.event.transactionHash,
            id: payment._id,
          }
        },
        matched: true,
        hasDuplicates
      });

      return;
    }

    // These cases should probably be handled
    if (withdrawals.total === 0) return;
    if (withdrawals.total > 1) return;

  });

  promises = withdrawals.map((withdrawal) => {
    return app.service('withdrawals').get(withdrawal._id);
  });

  let updatedWithdrawals = await Promise.all(promises);

  updatedWithdrawals.map((withdrawal) => {
    let matches = withdrawal.matches;
    if (matches.length === 0) return;

    let hasDuplicates = withdrawal.hasDuplicates;

    matches.map((match) => {
      patches.push(app.service('payments').patch(match.id, {
        $push: {
          matches: {
            hash: withdrawal.event.transactionHash,
            id: withdrawal._id,
          }
        },
        matched: true,
        hasDuplicates,
      }))
    });
  });

  await Promise.all(patches);
}
