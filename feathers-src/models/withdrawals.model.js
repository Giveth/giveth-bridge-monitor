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
  return mongooseClient.model('withdrawals', withdrawals);
};
