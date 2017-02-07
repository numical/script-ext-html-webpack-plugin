'use strict';

const EVENT = require('./constants.js').EVENT;

const debug = require('./common.js').debug;
const matches = require('./common.js').matches;
const denormaliseOptions = require('./config.js');
const shouldAddResourceHints = require('./resource-hints.js').shouldAddResourceHints;
const addInitialChunkResourceHints = require('./initial-chunk-resource-hints.js');
const addAsyncChunkResourceHints = require('./async-chunk-resource-hints.js');
const elements = require('./elements.js');

const debugEvent = msg => {
  debug(`${EVENT}: ${msg}`);
};

const falsySafeConcat = arrays => {
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
          debugEvent('starting');
          if (elements.shouldUpdate(options)) {
            debugEvent('replacing <head> <script> elements');
            pluginArgs.head = elements.update(compilation, options, pluginArgs.head);
            debugEvent('replacing <body> <script> elements');
            pluginArgs.body = elements.update(compilation, options, pluginArgs.body);
          }
          if (shouldAddResourceHints(options)) {
            debugEvent('adding resource hints');
            pluginArgs.head = falsySafeConcat([
              pluginArgs.head,
              addInitialChunkResourceHints(options, pluginArgs.head),
              addInitialChunkResourceHints(options, pluginArgs.body),
              addAsyncChunkResourceHints(options, compilation)
            ]);
          }
          debugEvent('completed');
          callback(null, pluginArgs);
        } catch (err) {
          callback(err);
        }
      });
    });
    compiler.plugin('emit', (compilation, callback) => {
      if (options.inline.test.length > 0 && options.removeInlinedAssets) {
        debug('emit: deleting assets');
        Object.keys(compilation.assets).forEach((assetName) => {
          if (matches(assetName, options.inline.test)) {
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
