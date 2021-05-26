const populate = require('../populate');

module.exports = async time => {
  const run = async () => {
    const keepGoing = await populate();

    if (keepGoing) setTimeout(run, time);
    else {
      console.log('False returned from populate, stopping');
    }
  };
  run();
};
