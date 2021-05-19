// Initializes the `depositors` service on path `/depositors`
const createService = require('feathers-memory');
const hooks = require('./depositors.hooks');

module.exports = app => {
  const options = {
    name: 'depositors',
    paginate: false,
  };

  // Initialize our service with any options it requires
  app.use('/depositors', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('depositors');

  service.hooks(hooks);
};
