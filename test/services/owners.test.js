const assert = require('assert');
const app = require('../../src/app');

describe('\'owners\' service', () => {
  it('registered the service', () => {
    const service = app.service('owners');

    assert.ok(service, 'Registered the service');
  });
});
