module.exports = app => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const payments = new Schema(
    {
      earliestPayTime: { type: Date, index: true },
    },
    {
      timestamp: true,
      strict: false,
    },
  );

  return mongooseClient.model('payments', payments);
};
