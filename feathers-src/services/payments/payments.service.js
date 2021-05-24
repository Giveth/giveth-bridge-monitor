// Initializes the `payments` service on path `/payments`
const createService = require('feathers-mongoose');
const createModel = require('../../models/payments.model');
const hooks = require('./payments.hooks');
const { defaultFeatherMongooseOptions } = require('../serviceCommons');

module.exports = app => {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'payments',
    Model,
    paginate,
    ...defaultFeatherMongooseOptions,
  };

  // Initialize our service with any options it requires
  app.use('/payments', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('payments');

  service.hooks(hooks);
};
