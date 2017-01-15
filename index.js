'use strict';

const debug = require('debug')('ScriptExt');

const PLUGIN = 'ScriptExtHtmlWebpackPlugin';
const EVENT = 'html-webpack-plugin-alter-asset-tags';
const INLINE = 'inline';
const SYNC = 'sync';
const ATTRIBUTE_PRIORITIES = [SYNC, 'async', 'defer'];
const MODULE = 'module';
const DEFAULT_OPTIONS = {
  inline: [],
  sync: [],
  async: [],
  defer: [],
  defaultAttribute: SYNC,
  module: [],
  prefetch: [],
  preload: [],
  removeInlinedAssets: true
};
const PUBLIC_PATH_PREFIX = /^.*\//;

const shouldUpdateElements = (options) => {
  if (ATTRIBUTE_PRIORITIES.indexOf(options.defaultAttribute) < 0) {
    throw new Error(`${PLUGIN}: invalid default attribute`);
  }
  return !(options.defaultAttribute === SYNC &&
           options.inline.length === 0 &&
           options.async.length === 0 &&
           options.defer.length === 0 &&
           options.module.length === 0);
};

const shouldAddResourceHints = (options) => {
  return !(options.prefetch.length === 0 &&
           options.preload.length === 0);
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

const matches = (scriptName, patterns) => {
  return patterns.some((pattern) => {
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

const hasScriptName = (tag) => tag.attributes && tag.attributes.src;

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

const concat = (arrays) => {
  return arrays.reduce(
    (combined, array) => array ? combined.concat(array) : combined,
    []
  );
};

class ScriptExtHtmlWebpackPlugin {
  constructor (options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
  }
  apply (compiler) {
    const options = this.options;
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin(EVENT, (pluginArgs, callback) => {
        try {
          debug(`${EVENT}: starting`);
          if (shouldUpdateElements(options)) {
            debug(`${EVENT}: replacing <head> <script> elements`);
            pluginArgs.head = updateElements(compilation, options, pluginArgs.head);
            debug(`${EVENT}: replacing <body> <script> elements`);
            pluginArgs.body = updateElements(compilation, options, pluginArgs.body);
          }
          if (shouldAddResourceHints(options)) {
            debug(`${EVENT}: adding resource hints`);
            pluginArgs.head = concat([
              pluginArgs.head,
              addResourceHints(options, pluginArgs.head),
              addResourceHints(options, pluginArgs.body)
            ]);
          }
          debug(`${EVENT}: completed`);
          callback(null, pluginArgs);
        } catch (err) {
          callback(err);
        }
      });
    });
    compiler.plugin('emit', (compilation, callback) => {
      if (options[INLINE].length > 0 && options.removeInlinedAssets) {
        debug('emit: deleting assets');
        Object.keys(compilation.assets).forEach((assetName) => {
          if (matches(assetName, options[INLINE])) {
            debug(`emit: deleting asset '${assetName}'`);
            delete compilation.assets[assetName];
          }
        });
      }
      callback();
    });
  }
}

module.exports = ScriptExtHtmlWebpackPlugin;
