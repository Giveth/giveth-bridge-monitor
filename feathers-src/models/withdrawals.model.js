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
  return mongooseClient.model('withdrawals', withdrawals);
};
