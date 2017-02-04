'use strict';

const debug = require('debug')('ScriptExt');

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
  matches
};
