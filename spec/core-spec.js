/* eslint-env jasmine */
'use strict';

const path = require('path');
const deleteDir = require('rimraf');
const version = require('./helpers/versions.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('../index.js');
const testPlugin = require('./helpers/core-test.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isWebpack4 = () => version.webpack.startsWith('4');

const OUTPUT_DIR = path.join(__dirname, '../dist');

const baseConfig = (scriptExtOptions, htmlWebpackOptions, outputFilename) => {
  htmlWebpackOptions = htmlWebpackOptions || {};
  outputFilename = outputFilename || '[name].js';
  const config = {
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
      new HtmlWebpackPlugin(htmlWebpackOptions),
      new ScriptExtHtmlWebpackPlugin(scriptExtOptions)
    ]
  };
  if (isWebpack4()) {
    config.mode = 'development';
  }
  return config;
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
    const config = baseConfig({}, {}, 'index_bundle.js');
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
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('sets async default for single script with webpack chunk hashing', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async'
      },
      {},
      'index_bundle[chunkhash].js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle[0-9a-f]*.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('sets async default for single script with html-webpack-plugin hashing', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async'
      },
      {
        hash: true
      },
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js\?[0-9a-f]*" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('sets defer default for single script', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'defer'
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" defer><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('sets defer default for single script', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'defer'
      },
      {
        hash: true
      },
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js\?[0-9a-f]*" defer><\/script>)/
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
        sync: 'a',
        defer: 'b',
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
        defer: /(a|b).*/,
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
        defer: /a.*/,
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
        defer: /a.*/,
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
    var otherPluginCalled = false;
    const otherPlugin = {
      apply: compiler => {
        compiler.plugin('compilation', compilation => {
          compilation.plugin('html-webpack-plugin-after-html-processing', (htmlPluginData, callback) => {
            otherPluginCalled = true;
            if (callback) {
              callback(null, htmlPluginData);
            }
          });
        });
      }
    };
    const additionalTest = () => {
      expect(otherPluginCalled).toBe(true);
      done();
    };
    const config = baseConfig(
      {
        defaultAttribute: 'async'
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    config.plugins.push(otherPlugin);
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" async><\/script>)/
    ];
    testPlugin(config, expected, additionalTest);
  });

  it('module attribute selectively added', (done) => {
    const config = baseConfig(
      {
        module: 'b',
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
        async: 'b',
        defer: /(a|b)/,
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
        inline: 'b',
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

  it('inlining works for single script with html-webpack-plugin hashing', (done) => {
    const config = baseConfig(
      {
        inline: 'b',
        defaultAttribute: 'async'
      },
      {
        hash: true
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js\?[0-9a-f]*" async><\/script>)/,
      /(<script>[\s\S]*<\/script>)/,
      /(<script type="text\/javascript" src="c.js\?[0-9a-f]*" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('works with minimized inlined scripts', done => {
    const config = baseConfig(
      {
        inline: /sim/
      }
    );
    config.entry = {
      a: path.join(__dirname, 'fixtures/script1.js'),
      simple1: path.join(__dirname, 'fixtures/simplescript1.js'),
      simple2: path.join(__dirname, 'fixtures/simplescript2.js')
    };
    if (isWebpack4()) {
      config.optimization = {
        minimize : true,
        minimizer: [new UglifyJsPlugin()]
      };
    } else {
      config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    }
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js"><\/script>)/,
      isWebpack4() ? /(<script>.*console\.log\('it works!'\).*<\/script>)/ : /(<script>.*console\.log\("it works!"\).*<\/script>)/,
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
    config.output.publicPath = '/subdomain/subdir/';
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/a.js" async><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/c.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('handles output.publicPath without end separator', done => {
    const config = baseConfig(
      {
        defaultAttribute: 'async'
      }
    );
    config.output.publicPath = '/subdomain/subdir';
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/a.js" async><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/c.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('named scripts work with output.publicPath', done => {
    const config = baseConfig(
      {
        sync: 'a.js',
        hash: true,
        async: ['b.js'],
        defer: 'c.js'
      }
    );
    config.output.publicPath = '/subdomain/subdir/';
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/a.js"><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/c.js" defer><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('multiple merged scripts work with output.publicPath', done => {
    const config = baseConfig(
      {
        async: 'main'
      }
    );
    config.entry = [
      path.join(__dirname, 'fixtures/script1.js'),
      path.join(__dirname, 'fixtures/script2.js'),
      path.join(__dirname, 'fixtures/script3.js')
    ];
    config.output.publicPath = '/subdomain/subdir/';
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="\/subdomain\/subdir\/main.js" async><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('works with handlebars template <script> elements', done => {
    const config = baseConfig(
        {},
        {},
        'index_bundle.js'
      );
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

  it('inline scripts work with output.publicPath', done => {
    const config = baseConfig(
      {
        inline: 'a'
      }
    );
    config.output.publicPath = '/subdomain/';
    const expected = baseExpectations();
    expected.html = [
      /(<script>[\s\S]*<\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('adds prefetch resource hint for specific script', (done) => {
    const config = baseConfig(
      {
        prefetch: ['index_bundle.js']
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js"><\/script>)/,
      /(<link rel="prefetch" href="index_bundle.js" as="script"\/)>/
    ];
    testPlugin(config, expected, done);
  });

  it('adds prefetch resource hint for specific script with html-webpack-plugin hashing', (done) => {
    const config = baseConfig(
      {
        prefetch: ['index_bundle.js']
      },
      {
        hash: true
      },
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js\?[0-9a-f]*"><\/script>)/,
      /(<link rel="prefetch" href="index_bundle.js\?[0-9a-f]*" as="script"\/)>/
    ];
    testPlugin(config, expected, done);
  });

  it('adds preload resource hint for specific script', (done) => {
    const config = baseConfig(
      {
        preload: 'index_bundle.js'
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js"><\/script>)/,
      /(<link rel="preload" href="index_bundle.js" as="script"\/)>/
    ];
    testPlugin(config, expected, done);
  });

  it('adds preload and prefetch for multiple scripts', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        prefetch: [/^a/],
        preload: /^b/
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js" async><\/script>)/,
      /(<script type="text\/javascript" src="b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="c.js" async><\/script>)/,
      /(<link rel="prefetch" href="a.js" as="script"\/)>/,
      /(<link rel="preload" href="b.js" as="script"\/)>/
    ];
    expected.not.html = [
      /(<link rel="prefetch" href="c.js" as="script"\/)>/,
      /(<link rel="preload" href="a.js" as="script"\/)>/
    ];
    testPlugin(config, expected, done);
  });

  it('preload has priority over prefetch', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        defer: ['c.js'],
        prefetch: /\.js$/,
        preload: [/^b/]
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js" async><\/script>)/,
      /(<script type="text\/javascript" src="b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="c.js" defer><\/script>)/,
      /(<link rel="prefetch" href="a.js" as="script"\/)>/,
      /(<link rel="preload" href="b.js" as="script"\/)>/,
      /(<link rel="prefetch" href="c.js" as="script"\/)>/
    ];
    testPlugin(config, expected, done);
  });

  it('preload and prefetch include output.publicPath', (done) => {
    const config = baseConfig(
      {
        prefetch: [/^a/],
        preload: /^b/
      }
    );
    config.output.publicPath = '/subdomain/';
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="\/subdomain\/a.js"><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/b.js"><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/c.js"><\/script>)/,
      /(<link rel="prefetch" href="\/subdomain\/a.js" as="script"\/)>/,
      /(<link rel="preload" href="\/subdomain\/b.js" as="script"\/)>/
    ];
    testPlugin(config, expected, done);
  });

  it('preload and prefetch handle output.publicPath without end separator', (done) => {
    const config = baseConfig(
      {
        prefetch: [/^a/],
        preload: /^b/
      }
    );
    config.output.publicPath = '/subdomain';
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="\/subdomain\/a.js"><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/b.js"><\/script>)/,
      /(<script type="text\/javascript" src="\/subdomain\/c.js"><\/script>)/,
      /(<link rel="prefetch" href="\/subdomain\/a.js" as="script"\/)>/,
      /(<link rel="preload" href="\/subdomain\/b.js" as="script"\/)>/
    ];
    testPlugin(config, expected, done);
  });

  it('adds a custom attribute to a single script', (done) => {
    const config = baseConfig(
      {
        custom: {
          test: /.js$/,
          attribute: 'customAttribute'
        }
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" customAttribute><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('adds a custom attribute with a value to a single script', (done) => {
    const config = baseConfig(
      {
        custom: {
          test: /.js$/,
          attribute: 'customAttribute',
          value: 'xyz'
        }
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="index_bundle.js" customAttribute="xyz"><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('custom attributes work with inlined scripts (e.g. nonces)', (done) => {
    const config = baseConfig(
      {
        inline: 'b',
        custom: {
          test: /^$/,
          attribute: 'nonce',
          value: 'abcde'
        }
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/javascript" src="a.js"><\/script>)/,
      /(<script nonce="abcde">)/,
      /(<script type="text\/javascript" src="c.js"><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('multiple customer attributes over multiple scripts', (done) => {
    const config = baseConfig(
      {
        async: [/(a|c).*/, 'b'],
        defer: /a.*/,
        custom: [
          {
            test: /(a|c)/,
            attribute: 'wibble'
          },
          {
            test: 'a',
            attribute: 'type',
            value: 'text/paperscript'
          }
        ],
        defaultAttribute: 'async'
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script type="text\/paperscript" src="a.js" async wibble><\/script>)/,
      /(<script type="text\/javascript" src="b.js" async><\/script>)/,
      /(<script type="text\/javascript" src="c.js" async wibble><\/script>)/
    ];
    testPlugin(config, expected, done);
  });
});
