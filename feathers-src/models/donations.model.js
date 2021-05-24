module.exports = app => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const donations = new Schema(
    {},
    {
      timestamp: true,
      strict: false,
    },
  );

  donations.index({ 'event.blockNumber': 1 });
  return mongooseClient.model('donations', donations);
};
