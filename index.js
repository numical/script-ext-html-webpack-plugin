'use strict';

const SYNC = 'sync';
const ATTRIBUTE_PRIORITIES = [SYNC, 'async', 'defer'];
const DEFAULT_OPTIONS = {
  sync: [],
  async: [],
  defer: [],
  defaultAttribute: SYNC
};
const SCRIPT_PATTERN = new RegExp('(<script.*?><\/script>)', 'gi');
const SRC_PATTERN = new RegExp('src="(.*)"', 'i');

class ScriptExtHtmlWebpackPlugin {

  constructor (options) {
    this.options = Object.assign(DEFAULT_OPTIONS, options);
  }

  apply (compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('html-webpack-plugin-after-html-processing', (htmlPluginData, callback) => {
        this.setScriptAttributes(htmlPluginData, callback);
      });
    });
  }

  setScriptAttributes (htmlPluginData, callback) {
    if (this.options.defaultAttribute === SYNC &&
        this.options.async.length === 0 &&
        this.options.defer.length === 0) {
      return callback();
    }
    if (ATTRIBUTE_PRIORITIES.indexOf(this.options.defaultAttribute) < 0) {
      throw new Error('ScriptExtHtmlWebpackPlugin: invalid default attribute');
    }
    htmlPluginData.html = htmlPluginData.html.replace(SCRIPT_PATTERN, (scriptElement) => {
      const scriptName = SRC_PATTERN.exec(scriptElement)[1];
      const attribute = this.generateScriptAttribute(scriptName);
      return '<script src="' + scriptName + '" ' + attribute + '></script>';
    });
    callback();
  }

  generateScriptAttribute (scriptName) {
    var scriptAttribute = null;
    ATTRIBUTE_PRIORITIES.forEach((attribute) => {
      if (scriptAttribute === null &&
          this.options[attribute].some((pattern) => {
            if (pattern instanceof RegExp) {
              return pattern.test(scriptName);
            } else {
              return scriptName.indexOf(pattern) > -1;
            }
          })) {
        scriptAttribute = attribute;
      }
    });
    if (scriptAttribute === null) {
      scriptAttribute = this.options.defaultAttribute;
    }
    if (scriptAttribute === SYNC) {
      scriptAttribute = '';
    }
    return scriptAttribute;
  }
}

module.exports = ScriptExtHtmlWebpackPlugin;
