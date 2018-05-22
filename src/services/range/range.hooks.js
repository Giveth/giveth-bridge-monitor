

module.exports = {
  before: {
    all: [],
    find: [],
    get: [async (context) => {
      const record = await context.service.find({query: {_id: 1}});

      if (record.total === 1){
        context.result = record.data[0];
        return context;
      }

      const homeStart = context.app.get('homeStartBlock');
      const foreignStart = context.app.get('foreignStartBlock');
      const recordCreation = await context.service.create({
        _id: 1,
        home: homeStart,
        foreign: foreignStart,
      });
      context.result = recordCreation;
      return context;
    }],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
