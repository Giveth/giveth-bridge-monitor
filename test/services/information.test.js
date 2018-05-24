const assert = require('assert');
const app = require('../../src/app');

describe('\'information\' service', () => {
  it('registered the service', () => {
    const service = app.service('information');

    assert.ok(service, 'Registered the service');
  });
});
