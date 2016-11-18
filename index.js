'use strict';

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
  removeInlinedAssets: true
};
const SCRIPT_PATTERN = new RegExp('(<script.*?></script>)', 'gi');
const SRC_PATTERN = new RegExp('src="(.*)"', 'i');
const JS_PATTERN = /\.js$/;

function shouldReplaceScriptElements (options) {
  if (ATTRIBUTE_PRIORITIES.indexOf(options.defaultAttribute) < 0) {
    throw new Error('ScriptExtHtmlWebpackPlugin: invalid default attribute');
  }
  return !(options.defaultAttribute === SYNC &&
           options.inline.length === 0 &&
           options.async.length === 0 &&
           options.defer.length === 0 &&
           options.module.length === 0);
}

function replaceScriptElements (options, htmlPluginData, compilation, callback) {
  htmlPluginData.html = htmlPluginData.html.replace(SCRIPT_PATTERN, (scriptElement) => {
    const scriptName = SRC_PATTERN.exec(scriptElement)[1];
    if (matches(scriptName, options[INLINE])) {
      return generateInlineScriptElement(scriptName, compilation);
    } else {
      return generateSrcScriptElement(options, scriptName);
    }
  });
  callback(null, htmlPluginData);
}

function matches (scriptName, patterns) {
  return patterns.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(scriptName);
    } else {
      return scriptName.indexOf(pattern) > -1;
    }
  });
}

function generateInlineScriptElement (scriptName, compilation) {
  return '<script>' + compilation.assets[scriptName].source() + '</script>';
}

function generateSrcScriptElement (options, scriptName) {
  let scriptAttributes = null;
  ATTRIBUTE_PRIORITIES.forEach((attribute) => {
    if (scriptAttributes === null && matches(scriptName, options[attribute])) {
      scriptAttributes = attribute;
    }
  });
  if (scriptAttributes === null) {
    scriptAttributes = options.defaultAttribute;
  }
  if (scriptAttributes === SYNC) {
    scriptAttributes = '';
  } else {
    scriptAttributes = ' ' + scriptAttributes;
  }
  if (matches(scriptName, options[MODULE])) {
    scriptAttributes = scriptAttributes + ' type="module"';
  } else {
    scriptAttributes = ' type="text/javascript"' + scriptAttributes;
  }
  return '<script src="' + scriptName + '"' + scriptAttributes + '></script>';
}

class ScriptExtHtmlWebpackPlugin {
  constructor (options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
  }
  apply (compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('html-webpack-plugin-after-html-processing', (htmlPluginData, callback) => {
        if (shouldReplaceScriptElements(this.options)) {
          replaceScriptElements(this.options, htmlPluginData, compilation, callback);
        } else {
          callback(null, htmlPluginData);
        }
      });
    });
    compiler.plugin('emit', (compilation, callback) => {
      if (this.options[INLINE].length > 0 && this.options.removeInlinedAssets) {
        Object.keys(compilation.assets).forEach((assetName) => {
          if (JS_PATTERN.test(assetName) && matches(assetName, this.options[INLINE])) {
            delete compilation.assets[assetName];
          }
        });
      }
      callback();
    });
  }
}

module.exports = ScriptExtHtmlWebpackPlugin;
