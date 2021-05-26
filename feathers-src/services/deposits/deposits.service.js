// Initializes the `deposits` service on path `/deposits`
const createService = require('feathers-mongoose');
const createModel = require('../../models/deposits.model');
const hooks = require('./deposits.hooks');

module.exports = app => {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'deposits',
    Model,
    paginate,
  };

  // Initialize our service with any options it requires
  app.use('/deposits', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('deposits');

  service.hooks(hooks);
};
