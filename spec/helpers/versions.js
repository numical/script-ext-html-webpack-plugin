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
    minor: 35,
    patch: 3,
    display: '4.35.3'
  }
};

const HWP_VERSION = {
  hwp3: {
    major: 3,
    minor: 2,
    patch: 0,
    display: '3.2.0'
  },
  hwp4: {
    major: 4,
    minor: 0,
    patch: 0,
    display: '4.0.0-beta.5'
  }
};

const selected = VERSIONS[process.env.VERSION];
if (selected) {
  setModuleVersion('webpack', selected.display, true);
} else {
  throw new Error(`Unknown webpack version '${process.env.VERSION}'`);
}

const selectedForHwp = HWP_VERSION[process.env.HWP_VERSION];
if (selectedForHwp) {
  setModuleVersion('html-webpack-plugin', selectedForHwp.display, true);
} else {
  throw new Error(`Unknown html-webpack-plugin version '${process.env.HWP_VERSION}'`);
}

selected['html-webpack-plugin'] = selectedForHwp;

module.exports = selected;
