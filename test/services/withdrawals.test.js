const assert = require('assert');
const app = require('../../src/app');

describe('\'withdrawals\' service', () => {
  it('registered the service', () => {
    const service = app.service('withdrawals');

    assert.ok(service, 'Registered the service');
  });
});
