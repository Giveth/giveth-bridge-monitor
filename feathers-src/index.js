/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);
const poll = require('./lib/helpers/poll');
const pollTime = app.get('pollTime');

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', async () => {
    logger.info('Feathers application started on http://%s:%d', app.get('host'), port);
    poll(pollTime);
  }
);
