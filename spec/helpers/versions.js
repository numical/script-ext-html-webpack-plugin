'use strict';

const setModuleVersion = require('dynavers')('dynavers.json');

const VERSIONS = {
  webpack1: {
    isWebpack1: true,
    isWebpack2: false,
    webpack: '1.14.0'
  },
  webpack2: {
    isWebpack1: false,
    isWebpack2: true,
    webpack: '2.2.0'
  }
};

const selected = VERSIONS[process.env.VERSION];
if (selected) {
  setModuleVersion('webpack', selected.webpack, true);
} else {
  throw new Error(`Unknown webpack version '${process.env.VERSION}'`);
}

module.exports = selected;

