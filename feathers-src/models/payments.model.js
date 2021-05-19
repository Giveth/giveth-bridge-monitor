module.exports = app => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const payments = new Schema(
    {},
    {
      timestamp: true,
      strict: false,
    },
  );
  return mongooseClient.model('payments', payments);
};
