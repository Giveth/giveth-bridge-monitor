module.exports = app => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const range = new Schema(
    {},
    {
      timestamp: true,
      strict: false,
    },
  );

  return mongooseClient.model('range', range);
};
