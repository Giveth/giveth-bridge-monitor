// Initializes the `range` service on path `/range`
const createService = require('feathers-mongoose');
const createModel = require('../../models/range.model');
const hooks = require('./range.hooks');
const { defaultFeatherMongooseOptions } = require('../serviceCommons');

module.exports = app => {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'range',
    Model,
    paginate,
    ...defaultFeatherMongooseOptions,
  };

  // Initialize our service with any options it requires
  app.use('/range', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('range');

  service.hooks(hooks);
};
