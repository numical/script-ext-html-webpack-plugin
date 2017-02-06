'use strict';

const PUBLIC_PATH_PREFIX = require('./constants.js').PUBLIC_PATH_PREFIX;
const CHUNK_OPTIONS = ['all', 'initial'];

const matches = require('./common.js').matches;
const createResourceHint = require('./resource-hints.js').createResourceHint;

const addInitialChunkResourceHints = (options, tags) => {
  return tags
    .filter(hasScriptName)
    .reduce((hints, tag) => {
      const scriptName = getScriptName(tag);
      if (optionsMatch(options.preload, scriptName)) {
        hints.push(createResourceHint('preload', getRawScriptName(tag)));
      } else if (optionsMatch(options.prefetch, scriptName)) {
        hints.push(createResourceHint('prefetch', getRawScriptName(tag)));
      }
      return hints;
    },
    []
    );
};

const getScriptName = tag => {
  let scriptName = getRawScriptName(tag);
  // remove publicPath prefix
  if (scriptName.includes('/')) {
    scriptName = scriptName.replace(PUBLIC_PATH_PREFIX, '');
  }
  return scriptName;
};

const optionsMatch = (option, scriptName) => {
  return matches(option.chunks, CHUNK_OPTIONS) && matches(scriptName, option.test);
};

const getRawScriptName = tag => tag.attributes.src;

const hasScriptName = tag => tag.attributes && tag.attributes.src;

module.exports = addInitialChunkResourceHints;
