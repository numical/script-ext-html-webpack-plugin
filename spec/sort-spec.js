/* eslint-env jasmine */
'use strict';

const path = require('path');
const deleteDir = require('rimraf');
const version = require('./helpers/versions.js');
// const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('../index.js');
const testPlugin = require('./helpers/core-test.js');

const OUTPUT_DIR = path.join(__dirname, '../dist');

const baseConfig = (scriptExtOptions, outputFilename) => {
  outputFilename = outputFilename || '[name].js';
  return {
    entry: {
      a: path.join(__dirname, 'fixtures/script1.js'),
      b: path.join(__dirname, 'fixtures/script2.js'),
      c: path.join(__dirname, 'fixtures/script3.js')
    },
    output: {
      path: OUTPUT_DIR,
      filename: outputFilename
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'fixtures/sort-template.html')
      }),
      new ScriptExtHtmlWebpackPlugin(scriptExtOptions)
    ]
  };
};

const baseExpectations = () => ({
  html: [],
  js: [],
  files: [],
  not: {
    html: [],
    js: [],
    files: []
  }
});

describe(`Sort functionality (webpack ${version.webpack})`, function () {
  beforeEach((done) => {
    deleteDir(OUTPUT_DIR, done);
  });

  it('default position of head-bottom works', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        defaultPosition: 'head-bottom'
      },
        'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" async><\/script><\/head>)/
    ];
    testPlugin(config, expected, done);
  });

  it('default position of body-bottom works', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        defaultPosition: 'body-bottom'
      },
        'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" async><\/script><\/body>)/
    ];
    testPlugin(config, expected, done);
  });
});
