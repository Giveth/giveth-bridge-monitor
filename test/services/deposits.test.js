const assert = require('assert');
const app = require('../../src/app');

describe("'deposits' service", function () {
  it('registered the service', function () {
    const service = app.service('deposits');

    assert.ok(service, 'Registered the service');
  });
});
