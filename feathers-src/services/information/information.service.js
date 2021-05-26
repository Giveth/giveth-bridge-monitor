// Initializes the `information` service on path `/information`
const createService = require('feathers-memory');
const hooks = require('./information.hooks');

module.exports = app => {
  const options = {
    name: 'information',
    paginate: false,
  };

  // Initialize our service with any options it requires
  app.use('/information', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('information');

  service.hooks(hooks);
};
