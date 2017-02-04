'use strict';

const PLUGIN = 'ScriptExtHtmlWebpackPlugin';
const EVENT = 'html-webpack-plugin-alter-asset-tags';
const INLINE = 'inline';
const PUBLIC_PATH_PREFIX = /^.*\//;

module.exports = {
  PLUGIN,
  EVENT,
  INLINE,
  PUBLIC_PATH_PREFIX
};
