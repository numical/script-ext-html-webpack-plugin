'use strict';

const debug = require('debug')('ScriptExt');
const PLUGIN = 'ScriptExtHtmlWebpackPlugin';
const EVENT = 'html-webpack-plugin-alter-asset-tags';
const INLINE = 'inline';
const PUBLIC_PATH_PREFIX = /^.*\//;

const matches = (scriptName, tagOptions) => {
  return tagOptions.test.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(scriptName);
    } else {
      return scriptName.includes(pattern);
    }
  });
};

module.exports = {
  debug,
  PLUGIN,
  EVENT,
  INLINE,
  PUBLIC_PATH_PREFIX,
  matches
};
