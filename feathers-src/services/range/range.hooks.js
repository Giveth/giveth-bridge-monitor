const createInitialDoc = async context => {
  const record = await context.service.Model.findOne();

  if (record) {
    // eslint-disable-next-line prefer-destructuring
    // context.result = [record];
    return context;
  }

  const homeStart = context.app.get('homeStartBlock');
  const foreignStart = context.app.get('foreignStartBlock');
  await context.service.Model.create({
    home: homeStart,
    foreign: foreignStart,
  });
  // context.result = [recordCreation];
  return context;
};
module.exports = {
  before: {
    all: [],
    find: [createInitialDoc],
    get: [createInitialDoc],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
