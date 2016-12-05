/* eslint-env jasmine */
'use strict';

const compilationTest = require('./compilation-test.js');

module.exports = (config, expected, done) => {
  const webpack = require('webpack');
  webpack(config, (err, stats) => {
    compilationTest(err, stats, expected, done);
  });
};
