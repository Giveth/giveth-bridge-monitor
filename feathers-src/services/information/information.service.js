// Initializes the `information` service on path `/information`
const createService = require('feathers-nedb');
const createModel = require('../../models/information.model');
const hooks = require('./information.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'information',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/information', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('information');

  service.hooks(hooks);
};
