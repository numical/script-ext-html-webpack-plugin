'use strict';

const setModuleVersion = require('dynavers')('dynavers.json');

const VERSIONS = {
  webpack1: {
    webpack: '1.14.0'
  },
  webpack2: {
    webpack: '2.6.1'
  },
  webpack3: {
    webpack: '3.8.1'
  },
  webpack4: {
    webpack: '4.0.1'
  }
};

const selected = VERSIONS[process.env.VERSION];
if (selected) {
  setModuleVersion('webpack', selected.webpack, true);
} else {
  throw new Error(`Unknown webpack version '${process.env.VERSION}'`);
}

module.exports = selected;
