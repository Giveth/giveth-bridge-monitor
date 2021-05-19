const assert = require('assert');
const app = require('../../src/app');

describe("'range' service", function () {
  it('registered the service', function () {
    const service = app.service('range');

    assert.ok(service, 'Registered the service');
  });
});
