'use strict';

const PLUGIN = 'ScriptExtHtmlWebpackPlugin';
const EVENT = 'html-webpack-plugin-alter-asset-tags';
const PUBLIC_PATH_PREFIX = /^.*\//;

module.exports = {
  PLUGIN,
  EVENT,
  PUBLIC_PATH_PREFIX
};
