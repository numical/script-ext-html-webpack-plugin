'use strict';

const { debug, PLUGIN, EVENT, INLINE, PUBLIC_PATH_PREFIX } = require('./common.js');
const SYNC = 'sync';
const ATTRIBUTE_PRIORITIES = [SYNC, 'async', 'defer'];
const MODULE = 'module';

const shouldUpdateElements = (options) => {
  if (ATTRIBUTE_PRIORITIES.indexOf(options.defaultAttribute) < 0) {
    throw new Error(`${PLUGIN}: invalid default attribute`);
  }
  return !(options.defaultAttribute === SYNC &&
           options.inline.test.length === 0 &&
           options.async.test.length === 0 &&
           options.defer.test.length === 0 &&
           options.module.test.length === 0);
};

const updateElements = (compilation, options, tags) => {
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
  debug(`${EVENT}: processing <script> element: ${JSON.stringify(tag)}`);
  return (isInline(options, tag))
    ? replaceWithInlineElement(compilation, tag)
    : updateSrcElement(options, tag);
};

const isInline = (options, tag) => matches(tag.attributes.src, options[INLINE]);

const matches = (scriptName, tagOptions) => {
  return tagOptions.test.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(scriptName);
    } else {
      return scriptName.includes(pattern);
    }
  });
};

const replaceWithInlineElement = (compilation, tag) => {
  const scriptName = getScriptName(tag);
  const asset = compilation.assets[scriptName];
  if (!asset) throw new Error(`${PLUGIN}: no asset with href '${scriptName}'`);
  const newTag = {
    tagName: 'script',
    closeTag: true,
    innerHTML: asset.source()
  };
  debug(`${PLUGIN}: replaced by: ${JSON.stringify(newTag)}`);
  return newTag;
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

const updateSrcElement = (options, tag) => {
  const scriptName = getScriptName(tag);
  // select new attribute, if any, by priority
  let newAttribute;
  ATTRIBUTE_PRIORITIES.some(attribute => {
    if (matches(scriptName, options[attribute])) {
      newAttribute = attribute;
      return true;
    }
  });
  if (!newAttribute) newAttribute = options.defaultAttribute;
  if (newAttribute !== SYNC) {
    tag.attributes[newAttribute] = true;
  }
  // possibly overwrite existing type attribute
  if (matches(scriptName, options[MODULE])) {
    tag.attributes.type = 'module';
  }
  debug(`${PLUGIN}: updated to: ${JSON.stringify(tag)}`);
  return tag;
};

module.exports = {
  shouldUpdateElements,
  updateElements
};
