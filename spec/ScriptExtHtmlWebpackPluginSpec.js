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
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');

const OUTPUT_DIR = path.join(__dirname, '../dist');

function testPlugin (webpackConfig, expectedResults, done) {
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
  beforeEach((done) => {
    rm_rf(OUTPUT_DIR, done);
  });

  it('does nothing with default settings', (done) => {
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
      [/(<script type="text\/javascript" src="index_bundle.js"><\/script>)/],
      done);
  });

  it('sets async default for single script', (done) => {
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
      [/(<script src="index_bundle.js" type="text\/javascript" async><\/script>)/],
      done);
  });

  it('sets defer default for single script', (done) => {
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
      [/(<script src="index_bundle.js" type="text\/javascript" defer><\/script>)/],
      done);
  });

  it('sets async default for multiple scripts', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'async'
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript" async><\/script>)/,
        /(<script src="b.js" type="text\/javascript" async><\/script>)/,
        /(<script src="c.js" type="text\/javascript" async><\/script>)/
      ],
      done);
  });

  it('async string exceptions and sync default', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            async: ['a', 'b']
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript" async><\/script>)/,
        /(<script src="b.js" type="text\/javascript" async><\/script>)/,
        /(<script src="c.js" type="text\/javascript"><\/script>)/
      ],
      done);
  });

  it('sync and defer string exceptions and async default', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            sync: ['a'],
            defer: ['b'],
            defaultAttribute: 'async'
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript"><\/script>)/,
        /(<script src="b.js" type="text\/javascript" defer><\/script>)/,
        /(<script src="c.js" type="text\/javascript" async><\/script>)/
      ],
      done);
  });

  it('defer regex exceptions and sync default', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            defer: [/(a|b).*/],
            defaultAttribute: 'sync'
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript" defer><\/script>)/,
        /(<script src="b.js" type="text\/javascript" defer><\/script>)/,
        /(<script src="c.js" type="text\/javascript"><\/script>)/
      ],
      done);
  });

  it('sync precedence and defer default', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            sync: [/(a|c).*/],
            async: ['c'],
            defer: [/a.*/],
            defaultAttribute: 'defer'
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript"><\/script>)/,
        /(<script src="b.js" type="text\/javascript" defer><\/script>)/,
        /(<script src="c.js" type="text\/javascript"><\/script>)/
      ],
    done);
  });

  it('async precedence, mixed strings and regex, sync default', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            async: [/(a|c).*/, 'b'],
            defer: [/a.*/],
            defaultAttribute: 'sync'
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript" async><\/script>)/,
        /(<script src="b.js" type="text\/javascript" async><\/script>)/,
        /(<script src="c.js" type="text\/javascript" async><\/script>)/
      ],
      done);
  });

  it('plays happily with other plugins on the same tml plugin event', (done) => {
    testPlugin(
      { entry: path.join(__dirname, 'fixtures/script1_with_style.js'),
        output: {
          path: OUTPUT_DIR,
          filename: 'index_bundle.js'
        },
        module: {
          loaders: [
            {test: /\.css$/, loader: StyleExtHtmlWebpackPlugin.inline()}
          ]
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'async'
          }),
          new StyleExtHtmlWebpackPlugin()
        ]
      },
      [
        /(<script src="index_bundle.js" type="text\/javascript" async><\/script>)/,
        /<style>[\s\S]*background: snow;[\s\S]*<\/style>/
      ],
      done);
  });

  it('module attribute selectively added', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            module: ['b'],
            defaultAttribute: 'async'
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript" async><\/script>)/,
        /(<script src="b.js" async type="module"><\/script>)/,
        /(<script src="c.js" type="text\/javascript" async><\/script>)/
      ],
      done);
  });

  it('module attribute independent of other attributes', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            async: ['b'],
            defer: [/(a|b)/],
            module: ['b', 'c']
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript" defer><\/script>)/,
        /(<script src="b.js" async type="module"><\/script>)/,
        /(<script src="c.js" type="module"><\/script>)/
      ],
      done);
  });

  it('inlining works for single script', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          b: path.join(__dirname, 'fixtures/script2.js'),
          c: path.join(__dirname, 'fixtures/script3.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            inline: ['b'],
            defaultAttribute: 'async'
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript" async><\/script>)/,
        /(<script>[\s\S]*<\/script>)/,
        /(<script src="c.js" type="text\/javascript" async><\/script>)/
      ],
      done);
  });

  it('inlining works for multiple minified scripts', (done) => {
    testPlugin(
      {
        entry: {
          a: path.join(__dirname, 'fixtures/script1.js'),
          simple1: path.join(__dirname, 'fixtures/simplescript1.js'),
          simple2: path.join(__dirname, 'fixtures/simplescript2.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        plugins: [
          new webpack.optimize.UglifyJsPlugin(),
          new HtmlWebpackPlugin(),
          new ScriptExtHtmlWebpackPlugin({
            inline: [/sim/]
          })
        ]
      },
      [
        /(<script src="a.js" type="text\/javascript"><\/script>)/,
        /(<script>.*console\.log\("it works!"\).*<\/script>)/,
        /(<script>.*Date\.now\(\).*<\/script>)/
      ],
      done);
  });
});
