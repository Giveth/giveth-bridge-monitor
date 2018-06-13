// Initializes the `withdrawals` service on path `/withdrawals`
const createService = require('feathers-nedb');
const createModel = require('../../models/withdrawals.model');
const hooks = require('./withdrawals.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'withdrawals',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/withdrawals', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('withdrawals');

  service.hooks(hooks);
};
