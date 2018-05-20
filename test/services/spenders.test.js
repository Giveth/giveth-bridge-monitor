const assert = require('assert');
const app = require('../../src/app');

describe('\'spenders\' service', () => {
  it('registered the service', () => {
    const service = app.service('spenders');

    assert.ok(service, 'Registered the service');
  });
});
