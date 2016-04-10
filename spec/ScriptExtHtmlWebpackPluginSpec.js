/* eslint-env jasmine */
'use strict';

// for debugging
if (typeof v8debug === 'object') {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;
}

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const rm_rf = require('rimraf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('../index.js');

const OUTPUT_DIR = path.join(__dirname, '../dist');

function testPlugin (webpackConfig, expectedResults, done, showHtml) {
  const outputFile = 'index.html';
  webpack(webpackConfig, (err, stats) => {
    expect(err).toBeFalsy();
    const compilationErrors = (stats.compilation.errors || []).join('\n');
    expect(compilationErrors).toBe('');
    const compilationWarnings = (stats.compilation.warnings || []).join('\n');
    expect(compilationWarnings).toBe('');
    const outputFileExists = fs.existsSync(path.join(OUTPUT_DIR, outputFile));
    expect(outputFileExists).toBe(true);
    if (!outputFileExists) {
      return done();
    }
    const htmlContent = fs.readFileSync(path.join(OUTPUT_DIR, outputFile)).toString();
    if (showHtml) {
      console.log(htmlContent);
    }
    expectedResults.forEach((expectedResult) => {
      if (expectedResult instanceof RegExp) {
        expect(htmlContent).toMatch(expectedResult);
      } else {
        expect(htmlContent).toContain(expectedResult);
      }
    });
    done();
  });
}

describe('ScriptExtHtmlWebpackPlugin', function () {
  beforeEach(function (done) {
    rm_rf(OUTPUT_DIR, done);
  });

  it('does nothing with default settings', function (done) {
    testPlugin(
      { entry: path.join(__dirname, 'fixtures/script1.js'),
        output: {
          path: OUTPUT_DIR,
          filename: 'index_bundle.js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin()
        ]
      },
      [/(<script src="index_bundle.js"><\/script>)/],
      done);
  });

  it('sets async default for single script', function (done) {
    testPlugin(
      { entry: path.join(__dirname, 'fixtures/script1.js'),
        output: {
          path: OUTPUT_DIR,
          filename: 'index_bundle.js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'async'
          })
        ]
      },
      [/(<script src="index_bundle.js" async><\/script>)/],
      done);
  });

  it('sets defer default for single script', function (done) {
    testPlugin(
      { entry: path.join(__dirname, 'fixtures/script1.js'),
        output: {
          path: OUTPUT_DIR,
          filename: 'index_bundle.js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer'
          })
        ]
      },
      [/(<script src="index_bundle.js" defer><\/script>)/],
      done);
  });

  it('sets async default for multiple scripts', function (done) {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name]_bundle.js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'async'
          })
        ]
      },
      [
        /(<script src="a_bundle.js" async><\/script>)/,
        /(<script src="b_bundle.js" async><\/script>)/,
        /(<script src="c_bundle.js" async><\/script>)/
      ],
      done);
  });
});
