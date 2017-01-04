/* eslint-env jasmine */
'use strict';

// for debugging
if (process.env.DEBUG) {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;
}

require('jasmine2-custom-message');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
jasmine.getEnv().addReporter(new SpecReporter());
