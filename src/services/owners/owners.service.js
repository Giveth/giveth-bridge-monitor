// Initializes the `owners` service on path `/owners`
const createService = require('feathers-nedb');
const createModel = require('../../models/owners.model');
const hooks = require('./owners.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'owners',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/owners', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('owners');

  service.hooks(hooks);
};
