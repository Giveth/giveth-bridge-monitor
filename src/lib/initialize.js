const app = require('../app');

module.exports = async () => {
  const previous = await app.service('information').find({
    query: {
      _id: 1
    }
  });
  if (!previous.total) {
    const test = await app.service('information').create({
      _id: 1,
      homeContract: app.get('homeContractAddress'),
      foreignContract: app.get('foreignContractAddress')
    });
  }
}
