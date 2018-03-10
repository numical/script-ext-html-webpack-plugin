'use strict';

const setModuleVersion = require('dynavers')('dynavers.json');

const VERSIONS = {
  webpack1: {
    major: 1,
    minor: 14,
    patch: 0,
    display: '1.14.0'
  },
  webpack2: {
    major: 2,
    minor: 7,
    patch: 0,
    display: '2.7.0'
  },
  webpack3: {
    major: 3,
    minor: 11,
    patch: 0,
    display: '3.11.0'
  },
  webpack4: {
    major: 4,
    minor: 1,
    patch: 1,
    display: '4.1.1'
  }
};

const selected = VERSIONS[process.env.VERSION];
if (selected) {
  setModuleVersion('webpack', selected.display, true);
} else {
  throw new Error(`Unknown webpack version '${process.env.VERSION}'`);
}

module.exports = selected;
