module.exports = app => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const withdrawals = new Schema(
    {},
    {
      timestamp: true,
      strict: false,
    },
  );

  withdrawals.index({ 'event.blockNumber': 1 });
  withdrawals.index({
    'event.transactionHash': 1,
    'event.returnValues.recipient': 1,
    'event.returnValues.token': 1,
    'event.returnValues.amount': 1,
  });
  return mongooseClient.model('withdrawals', withdrawals);
};
