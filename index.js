'use strict';

const SYNC = 'sync';
const ATTRIBUTE_PRIORITIES = [SYNC, 'async', 'defer'];
const MODULE = 'module';
const DEFAULT_OPTIONS = {
  sync: [],
  async: [],
  defer: [],
  defaultAttribute: SYNC,
  module: []
};
const SCRIPT_PATTERN = new RegExp('(<script.*?><\/script>)', 'gi');
const SRC_PATTERN = new RegExp('src="(.*)"', 'i');

function setScriptAttributes (options, htmlPluginData, callback) {
  if (options.defaultAttribute === SYNC &&
      options.async.length === 0 &&
      options.defer.length === 0 &&
      options.module === 0) {
    return callback(null, htmlPluginData);
  }
  if (ATTRIBUTE_PRIORITIES.indexOf(options.defaultAttribute) < 0) {
    throw new Error('ScriptExtHtmlWebpackPlugin: invalid default attribute');
  }
  htmlPluginData.html = htmlPluginData.html.replace(SCRIPT_PATTERN, (scriptElement) => {
    const scriptName = SRC_PATTERN.exec(scriptElement)[1];
    const attribute = generateScriptAttribute(options, scriptName);
    return '<script src="' + scriptName + '"' + attribute + '></script>';
  });
  callback(null, htmlPluginData);
}

function generateScriptAttribute (options, scriptName) {
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
  }
  return scriptAttributes;
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

class ScriptExtHtmlWebpackPlugin {
  constructor (options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
  }
  apply (compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('html-webpack-plugin-after-html-processing', (htmlPluginData, callback) => {
        setScriptAttributes(this.options, htmlPluginData, callback);
      });
    });
  }
}

module.exports = ScriptExtHtmlWebpackPlugin;
