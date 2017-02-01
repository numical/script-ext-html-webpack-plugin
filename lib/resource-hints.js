'use strict';

const { PUBLIC_PATH_PREFIX, matches } = require('./common.js');

const shouldAddResourceHints = (options) => {
  return !(options.prefetch.test.length === 0 &&
           options.preload.test.length === 0);
};

const addResourceHints = (options, tags) => {
  return tags
    .filter(hasScriptName)
    .reduce((hints, tag) => {
      const scriptName = getScriptName(tag);
      if (matches(scriptName, options.preload)) {
        hints.push(createResourceHint('preload', tag));
      } else if (matches(scriptName, options.prefetch)) {
        hints.push(createResourceHint('prefetch', tag));
      }
      return hints;
    },
    []
    );
};

const getScriptName = (tag) => {
  let scriptName = getRawScriptName(tag);
  // remove publicPath prefix
  if (scriptName.includes('/')) {
    scriptName = scriptName.replace(PUBLIC_PATH_PREFIX, '');
  }
  return scriptName;
};

const getRawScriptName = (tag) => tag.attributes.src;

const hasScriptName = (tag) => tag.attributes && tag.attributes.src;

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
  shouldAddResourceHints,
  addResourceHints
};
