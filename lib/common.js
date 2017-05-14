'use strict';

const debug = require('debug')('ScriptExt');

const isScript = (tag) => tag.tagName === 'script';

const hasScriptName = tag => tag.attributes && tag.attributes.src;

const getRawScriptName = tag => tag.attributes.src;

const getPublicPath = options =>
  (options.compilationOptions.output && options.compilationOptions.output.publicPath)
  ? options.compilationOptions.output.publicPath
  : undefined;

const getScriptName = (options, tag) => {
  let scriptName = getRawScriptName(tag);
  const publicPath = getPublicPath(options);
  if (publicPath) {
    scriptName = scriptName.replace(publicPath, '');
  }
  if (options.htmlWebpackOptions.hash) {
    scriptName = scriptName.split('?', 1)[0];
  }
  return scriptName;
};

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
  getPublicPath,
  getRawScriptName,
  getScriptName,
  hasScriptName,
  isScript,
  matches
};
