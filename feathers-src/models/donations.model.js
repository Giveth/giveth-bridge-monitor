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

  return mongooseClient.model('donations', donations);
};
