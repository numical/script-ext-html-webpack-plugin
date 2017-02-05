'use strict';

const PUBLIC_PATH_PREFIX = require('./constants.js').PUBLIC_PATH_PREFIX;
const CHUNK_OPTIONS = ['all', 'initial'];
const matches = require('./common.js').matches;

const shouldAdd = options => {
  return !(options.prefetch.test.length === 0 &&
           options.preload.test.length === 0);
};

const add = (options, tags) => {
  return tags
    .filter(hasScriptName)
    .reduce((hints, tag) => {
      const scriptName = getScriptName(tag);
      if (optionsMatch(options.preload, scriptName)) {
        hints.push(createResourceHint('preload', tag));
      } else if (optionsMatch(options.prefetch, scriptName)) {
        hints.push(createResourceHint('prefetch', tag));
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

const createResourceHint = (rel, tag) => {
  return {
    tagName: 'link',
    closeTag: true,
    attributes: {
      rel: rel,
      href: getRawScriptName(tag),
      as: 'script'
    }
  };
};

module.exports = {
  shouldAdd,
  add
};
