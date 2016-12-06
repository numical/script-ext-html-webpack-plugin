/* eslint-env jasmine */
'use strict';

const path = require('path');
const deleteDir = require('rimraf');
const version = require('./helpers/versions.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('../../html-webpack-plugin/index.js'); // html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('../index.js');
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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
      new HtmlWebpackPlugin(),
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

describe(`Core functionality (webpack ${version.webpack})`, function () {
  beforeEach((done) => {
    deleteDir(OUTPUT_DIR, done);
  });

  it('does nothing with default settings', (done) => {
    const config = baseConfig({}, 'index_bundle.js');
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js"><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('sets async default for single script', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async'
      },
        'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('sets defer default for single script', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'defer'
      },
        'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" defer><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('sets async default for multiple scripts', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async'
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js" async><\/script>)/,
      /(<script type="text\/javascript" src="b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="c.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('async string exceptions and sync default', (done) => {
    const config = baseConfig(
      {
        async: ['a', 'b']
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js" async><\/script>)/,
      /(<script type="text\/javascript" src="b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="c.js"><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('sync and defer string exceptions and async default', (done) => {
    const config = baseConfig(
      {
        sync: ['a'],
        defer: ['b'],
        defaultAttribute: 'async'
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js"><\/script>)/,
      /(<script type="text\/javascript" src="b.js" defer><\/script>)/,
      /(<script type="text\/javascript" src="c.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('defer regex exceptions and sync default', (done) => {
    const config = baseConfig(
      {
        defer: [/(a|b).*/],
        defaultAttribute: 'sync'
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js" defer><\/script>)/,
      /(<script type="text\/javascript" src="b.js" defer><\/script>)/,
      /(<script type="text\/javascript" src="c.js"><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('sync precedence and defer default', (done) => {
    const config = baseConfig(
      {
        sync: [/(a|c).*/],
        async: ['c'],
        defer: [/a.*/],
        defaultAttribute: 'defer'
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js"><\/script>)/,
      /(<script type="text\/javascript" src="b.js" defer><\/script>)/,
      /(<script type="text\/javascript" src="c.js"><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('async precedence, mixed strings and regex, sync default', (done) => {
    const config = baseConfig(
      {
        async: [/(a|c).*/, 'b'],
        defer: [/a.*/],
        defaultAttribute: 'sync'
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js" async><\/script>)/,
      /(<script type="text\/javascript" src="b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="c.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('plays happily with other plugins on the same html plugin event', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async'
      },
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1_with_style.js');
    config.plugins.push(new ExtractTextPlugin('styles.css'));
    config.plugins.push(new StyleExtHtmlWebpackPlugin());
    config.module = {
      loaders: [
        {
          test: /\.css$/,
          loader: version.extractTextLoader(ExtractTextPlugin, ['css-loader'])
        }
      ]
    };
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" async><\/script>)/,
      /<style>[\s\S]*background: snow;[\s\S]*<\/style>/
    ];
    testPlugin(config, expected, done);
  });

  it('module attribute selectively added', (done) => {
    const config = baseConfig(
      {
        module: ['b'],
        defaultAttribute: 'async'
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js" async><\/script>)/,
      /(<script type="module" src="b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="c.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('module attribute independent of other attributes', (done) => {
    const config = baseConfig(
      {
        async: ['b'],
        defer: [/(a|b)/],
        module: ['b', 'c']
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js" defer><\/script>)/,
      /(<script type="module" src="b.js" async><\/script>)/,
      /(<script type="module" src="c.js"><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('inlining works for single script', (done) => {
    const config = baseConfig(
      {
        inline: ['b'],
        defaultAttribute: 'async'
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js" async><\/script>)/,
      /(<script>[\s\S]*<\/script>)/,
      /(<script type="text\/javascript" src="c.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('works with minimized inlined scripts', done => {
    const config = baseConfig(
      {
        inline: [/sim/]
      }
    );
    config.entry = {
      a: path.join(__dirname, 'fixtures/script1.js'),
      simple1: path.join(__dirname, 'fixtures/simplescript1.js'),
      simple2: path.join(__dirname, 'fixtures/simplescript2.js')
    };
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js"><\/script>)/,
      /(<script>.*console\.log\("it works!"\).*<\/script>)/,
      /(<script>.*Date\.now\(\).*<\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('default attribute works with output.publicPath', done => {
    const config = baseConfig(
      {
        defaultAttribute: 'async'
      }
    );
    config.output.publicPath = '/subdomain/';
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="\/subdomain\/a.js" async><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/c.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('named stylesheets work with output.publicPath', done => {
    const config = baseConfig(
      {
        sync: ['a.js'],
        async: ['b.js'],
        defer: ['c.js']
      }
    );
    config.output.publicPath = '/subdomain/';
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="\/subdomain\/a.js"><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/c.js" defer><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('muliple merged stylesheets work with output.publicPath', done => {
    const config = baseConfig(
      {
        async: ['main']
      }
    );
    config.entry = [
      path.join(__dirname, 'fixtures/script1.js'),
      path.join(__dirname, 'fixtures/script2.js'),
      path.join(__dirname, 'fixtures/script3.js')
    ];
    config.output.publicPath = '/subdomain/';
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="\/subdomain\/main.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('works with handlebars template <script> elements', done => {
    const config = baseConfig({}, 'index_bundle.js');
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    config.plugins = [
      new HtmlWebpackPlugin({
        template: '!!handlebars-loader!spec/fixtures/handlebars_template.hbs',
        testMsg: 'Hello World'
      }),
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'async'
      })
    ];
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" async><\/script>)/,
      /(<script>[\s\S]*Hello World[\s\S]*<\/script>)/
    ];
    testPlugin(config, expected, done);
  });
});
