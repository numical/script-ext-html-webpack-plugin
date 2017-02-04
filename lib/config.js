'use strict';

const PLUGIN = require('./constants.js').PLUGIN;

const DEFAULT_HASH = Object.freeze({
  test: []
});
const DEFAULT_RESOURCE_HINT_HASH = Object.freeze({
  test: [],
  chunks: 'initial'
});
const DEFAULT_OPTIONS = Object.freeze({
  inline: DEFAULT_HASH,
  sync: DEFAULT_HASH,
  async: DEFAULT_HASH,
  defer: DEFAULT_HASH,
  module: DEFAULT_HASH,
  prefetch: DEFAULT_RESOURCE_HINT_HASH,
  preload: DEFAULT_RESOURCE_HINT_HASH,
  defaultAttribute: 'sync',
  removeInlinedAssets: true
});

const denormaliseOptions = options => {
  if (!options) return DEFAULT_OPTIONS;
  validate(options);
  const denormalised = Object.assign({}, DEFAULT_OPTIONS, options);
  // now overwrite values which are not of DEFAULT_HASH form
  Object.keys(options).forEach(key => {
    const value = options[key];
    switch (key) {
      case 'inline':
      case 'sync':
      case 'async':
      case 'defer':
      case 'module':
        denormalised[key] = denormaliseValue(value, DEFAULT_HASH);
        break;
      case 'prefetch':
      case 'preload':
        denormalised[key] = denormaliseValue(value, DEFAULT_RESOURCE_HINT_HASH);
        break;
      default:
        break;
    }
  });
  return denormalised;
};

const validate = options => {
  const failureTests = []; // TODO!
  if (failureTests.some(test => test(options))) error();
};

const error = () => {
  throw new Error(`${PLUGIN}: invalid configuration - please see https://github.com/numical/script-ext-html-webpack-plugin#configuration`);
};

const denormaliseValue = (value, defaultProps) => {
  let denormalised = Object.assign({}, defaultProps);
  if (value) {
    denormalised.test = convertToArray(value, () => {
      if (typeof value === 'object') {
        if (value.chunks) {
          denormalised.chunks = value.chunks;
        }
        if (value.test) {
          return convertToArray(value.test, error);
        } else {
          error();
        }
      }
    });
  }
  return denormalised;
};

const convertToArray = (value, elseFn) => {
  if (typeof value === 'string') {
    return [value];
  } else if (value instanceof RegExp) {
    return [value];
  } else if (Array.isArray(value)) {
    return value;
  } else {
    return elseFn();
  }
};

module.exports = denormaliseOptions;
module.exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
