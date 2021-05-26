// Initializes the `spenders` service on path `/spenders`
const createService = require('feathers-mongoose');
const createModel = require('../../models/spenders.model');
const hooks = require('./spenders.hooks');

module.exports = app => {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'spenders',
    Model,
    paginate,
  };

  // Initialize our service with any options it requires
  app.use('/spenders', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('spenders');

  service.hooks(hooks);
};
