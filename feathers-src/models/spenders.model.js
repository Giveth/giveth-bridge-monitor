module.exports = app => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const spenders = new Schema(
    {},
    {
      timestamp: true,
      strict: false,
    },
  );
  return mongooseClient.model('spenders', spenders);
};
