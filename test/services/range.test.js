const assert = require('assert');
const app = require('../../src/app');

describe('\'range\' service', () => {
  it('registered the service', () => {
    const service = app.service('range');

    assert.ok(service, 'Registered the service');
  });
});
