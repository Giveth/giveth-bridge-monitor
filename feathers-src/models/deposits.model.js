module.exports = app => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const deposits = new Schema(
    {},
    {
      timestamp: true,
      strict: false,
    },
  );

  deposits.index({ 'event.blockNumber': 1 });
  return mongooseClient.model('deposits', deposits);
};
