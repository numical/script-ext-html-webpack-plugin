'use strict';

const { debug, EVENT, INLINE, matches } = require('./common.js');
const denormaliseOptions = require('./config.js');
const { shouldAddResourceHints, addResourceHints } = require('./resource-hints.js');
const { shouldUpdateElements, updateElements } = require('./elements.js');

const falsySafeConcat = (arrays) => {
  return arrays.reduce(
    (combined, array) => array ? combined.concat(array) : combined,
    []
  );
};

class ScriptExtHtmlWebpackPlugin {
  constructor (options) {
    this.options = denormaliseOptions(options);
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
            pluginArgs.head = falsySafeConcat([
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
