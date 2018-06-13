const assert = require('assert');
const app = require('../../src/app');

describe('\'deposits\' service', () => {
  it('registered the service', () => {
    const service = app.service('deposits');

    assert.ok(service, 'Registered the service');
  });
});
