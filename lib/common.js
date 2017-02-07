'use strict';

const debug = require('debug')('ScriptExt');

const matches = (toMatch, matchers) => {
  return matchers.some((matcher) => {
    if (matcher instanceof RegExp) {
      return matcher.test(toMatch);
    } else {
      return toMatch.includes(matcher);
    }
  });
};

module.exports = {
  debug,
  matches
};
