const EventStatus = {
  PENDING: 'Pending', // PENDING events were p/u by the ws subscription, but have yet to contain >= requiredConfirmations
  WAITING: 'Waiting', // WAITING events have been p/u by polling, have >= requiredConfirmations, & are ready to process
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  FAILED: 'Failed',
};

const createModel = app => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const event = new Schema(
    {
      logIndex: { type: Number, required: true },
      transactionIndex: { type: Number, required: true },
      transactionHash: { type: String, required: true, index: true },
      blockHash: { type: String, required: true, index: true },
      blockNumber: { type: Number, required: true },
      address: { type: String, required: true },
      type: { type: String },
      id: { type: String, required: true },
      returnValues: { type: Object },
      event: { type: String, index: true },
      signature: { type: String },
      raw: { type: Object },
      topics: [String],
      status: {
        type: String,
        require: true,
        enum: Object.values(EventStatus),
        default: EventStatus.WAITING,
        index: true,
      },
      processingError: { type: String },
      confirmations: { type: Number, require: true },
      isHomeEvent: { type: Boolean, default: false, index: true },
      timestamp: { type: Date },
    },
    {
      timestamp: true,
    },
  );
  event.index({ transactionHash: 1, event: 1 });
  event.index(
    {  blockNumber: 1, transactionIndex: 1, logIndex: 1, timestamp: 1 },
    { unique: true },
  );

  return mongooseClient.model('events', event);
};

module.exports = {
  createModel,
  EventStatus,
};
