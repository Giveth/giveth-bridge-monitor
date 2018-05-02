const populate = require('../populate');

module.exports = async (time) => {

  const run = async () => {
    await populate();
    setTimeout(run, time);
  }
  run();
}
