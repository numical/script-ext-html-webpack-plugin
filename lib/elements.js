'use strict';

const CONSTANTS = require('./constants.js');
const SYNC = 'sync';
const ATTRIBUTE_PRIORITIES = [SYNC, 'async', 'defer'];

const debug = require('./common.js').debug;
const matches = require('./common.js').matches;

const shouldUpdate = (options) => {
  if (ATTRIBUTE_PRIORITIES.indexOf(options.defaultAttribute) < 0) {
    throw new Error(`${CONSTANTS.PLUGIN}: invalid default attribute`);
  }
  return !(options.defaultAttribute === SYNC &&
           options.inline.test.length === 0 &&
           options.async.test.length === 0 &&
           options.defer.test.length === 0 &&
           options.module.test.length === 0);
};

const update = (compilation, options, tags) => {
  const update = updateElement.bind(null, compilation, options);
  return tags.map(update);
};

const updateElement = (compilation, options, tag) => {
  return (isScript(tag))
    ? updateScriptElement(compilation, options, tag)
    : tag;
};

const isScript = (tag) => tag.tagName === 'script';

const updateScriptElement = (compilation, options, tag) => {
  debug(`${CONSTANTS.EVENT}: processing <script> element: ${JSON.stringify(tag)}`);
  return (isInline(options, tag))
    ? replaceWithInlineElement(compilation, tag)
    : updateSrcElement(options, tag);
};

const isInline = (options, tag) => matches(tag.attributes.src, options.inline.test);

const replaceWithInlineElement = (compilation, tag) => {
  const scriptName = getScriptName(tag);
  const asset = compilation.assets[scriptName];
  if (!asset) throw new Error(`${CONSTANTS.PLUGIN}: no asset with href '${scriptName}'`);
  const newTag = {
    tagName: 'script',
    closeTag: true,
    innerHTML: asset.source()
  };
  debug(`${CONSTANTS.PLUGIN}: replaced by: ${JSON.stringify(newTag)}`);
  return newTag;
};

const getScriptName = (tag) => {
  let scriptName = getRawScriptName(tag);
  // remove publicPath prefix
  if (scriptName.includes('/')) {
    scriptName = scriptName.replace(CONSTANTS.PUBLIC_PATH_PREFIX, '');
  }
  return scriptName;
};

const getRawScriptName = (tag) => tag.attributes.src;

const updateSrcElement = (options, tag) => {
  const scriptName = getScriptName(tag);
  // select new attribute, if any, by priority
  let newAttribute;
  ATTRIBUTE_PRIORITIES.some(attribute => {
    if (matches(scriptName, options[attribute].test)) {
      newAttribute = attribute;
      return true;
    }
  });
  if (!newAttribute) newAttribute = options.defaultAttribute;
  if (newAttribute !== SYNC) {
    tag.attributes[newAttribute] = true;
  }
  // possibly overwrite existing type attribute
  if (matches(scriptName, options.module.test)) {
    tag.attributes.type = 'module';
  }
  debug(`${CONSTANTS.PLUGIN}: updated to: ${JSON.stringify(tag)}`);
  return tag;
};

module.exports = {
  shouldUpdate,
  update
};
