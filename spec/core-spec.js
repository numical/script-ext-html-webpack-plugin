/* eslint-env jasmine */
'use strict';

const path = require('path');
const deleteDir = require('rimraf');
const version = require('./helpers/versions.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('../index.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const testPlugin = require('./helpers/core-test.js');

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
  if (version.major === 4) {
    config.mode = 'production';
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

describe(`Core functionality (webpack ${version.display})`, function () {
  beforeEach((done) => {
    deleteDir(OUTPUT_DIR, done);
  });

  it('does nothing with default settings', (done) => {
    const config = baseConfig({}, {}, 'index_bundle.js');
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script (type="text\/javascript" )?src="index_bundle.js"><\/script>)/
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
      /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?src="index_bundle[0-9a-f]*.js" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?src="index_bundle.js\?[0-9a-f]*" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?(src="index_bundle.js" defer(="defer")?)|(defer(="defer")? src="index_bundle.js")><\/script>)/,
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
      /(<script (type="text\/javascript" )?(src="index_bundle.js\?[0-9a-f]*" defer(="defer")?)|(defer(="defer")? src="index_bundle.js\?[0-9a-f]*")><\/script>)/
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
      /(<script (type="text\/javascript" )?src="a.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="b.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?src="a.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="b.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js"><\/script>)/
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
      /(<script (type="text\/javascript" )?src="a.js"><\/script>)/,
      /(<script (type="text\/javascript" )?(src="b.js" defer(="defer")?)|(defer(="defer")? src="b.js")><\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?(src="a.js" defer(="defer")?)|(defer(="defer")? src="a.js")><\/script>)/,
      /(<script (type="text\/javascript" )?(src="b.js" defer(="defer")?)|(defer(="defer")? src="b.js")><\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js"><\/script>)/
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
      /(<script (type="text\/javascript" )?src="a.js"><\/script>)/,
      /(<script (type="text\/javascript" )?(src="b.js" defer(="defer")?)|(defer(="defer")? src="b.js")><\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js"><\/script>)/
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
      /(<script (type="text\/javascript" )?src="a.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="b.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js" async(="async")?><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('plays happily with other plugins on the same html plugin event', (done) => {
    let otherPluginCalled = false;
    const afterHtmlProcessingCallback = (htmlPluginData, callback) => {
      otherPluginCalled = true;
      // no callback webpack v4+
      if (callback) {
        callback(null, htmlPluginData);
      }
    };
    const compilationCallback = (compilation) => {
      if (compilation.hooks) {
        if (version['html-webpack-plugin'].major >= 4) {
          const htmlWebpackPlugin = require('html-webpack-plugin');
          const alterAssetTagGroups = htmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups;
          alterAssetTagGroups.tap('Test Plugin', afterHtmlProcessingCallback);
        } else {
          compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap('Test Plugin', afterHtmlProcessingCallback);
        }
      } else {
        compilation.plugin('html-webpack-plugin-after-html-processing', afterHtmlProcessingCallback);
      }
    };
    const otherPlugin = {
      apply: compiler => {
        if (compiler.hooks) {
          compiler.hooks.compilation.tap('TestPlugin', compilationCallback);
        } else {
          compiler.plugin('compilation', compilationCallback);
        }
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
      /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?src="a.js" async(="async")?><\/script>)/,
      /(<script type="module" src="b.js" async(="async")?><\/script>)|(<script src="b.js" async type="module"><\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?(src="a.js" defer(="defer")?)|(defer(="defer")? src="a.js")><\/script>)/,
      /(<script type="module" src="b.js" async(="async")?><\/script>)|(<script src="b.js" async type="module"><\/script>)/,
      /(<script type="module" src="c.js"><\/script>)|(<script src="c.js" type="module"><\/script>)/
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
      /(<script (type="text\/javascript" )?src="a.js" async(="async")?><\/script>)/,
      /(<script>[\s\S]*<\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?src="a.js\?[0-9a-f]*" async(="async")?><\/script>)/,
      /(<script>[\s\S]*<\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js\?[0-9a-f]*" async(="async")?><\/script>)/
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
    if (version.major < 4) {
      config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    } else {
      config.optimization = {
        minimize: true,
        minimizer: [new UglifyJsPlugin()]
      };
    }
    const expected = baseExpectations();
    expected.html = [
      /(<script (type="text\/javascript" )?src="a.js"><\/script>)/,
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
    config.output.publicPath = '/subdomain/subdir/';
    const expected = baseExpectations();
    expected.html = [
      /(<script (type="text\/javascript" )?src="\/subdomain\/subdir\/a.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="\/subdomain\/subdir\/b.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="\/subdomain\/subdir\/c.js" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?src="\/subdomain\/subdir\/a.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="\/subdomain\/subdir\/b.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="\/subdomain\/subdir\/c.js" async(="async")?><\/script>)/
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
      /(<script (type="text\/javascript" )?src="\/subdomain\/subdir\/a.js"><\/script>)/,
      /(<script (type="text\/javascript" )?src="\/subdomain\/subdir\/b.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?(src="\/subdomain\/subdir\/c.js" defer(="defer")?)|(defer(="defer")? src="\/subdomain\/subdir\/c.js")><\/script>)/
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
      /(<script (type="text\/javascript" )?src="\/subdomain\/subdir\/main.js" async(="async")?><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  if (version.major < 4) {
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
        /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/,
        /(<script>[\s\S]*Hello World[\s\S]*<\/script>)/
      ];
      testPlugin(config, expected, done);
    });
  }

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
      /(<script (type="text\/javascript" )?src="index_bundle.js"><\/script>)/,
      /(<link rel="prefetch" href="index_bundle.js" as="script"((>)|(\/>)|(><\/link>)))/
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
      /(<script (type="text\/javascript" )?src="index_bundle.js\?[0-9a-f]*"><\/script>)/,
      /(<link rel="prefetch" href="index_bundle.js\?[0-9a-f]*" as="script"((>)|(\/>)|(><\/link>)))/
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
      /(<script (type="text\/javascript" )?src="index_bundle.js"><\/script>)/,
      /(<link rel="preload" href="index_bundle.js" as="script"((>)|(\/>)|(><\/link>)))/
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
      /(<script (type="text\/javascript" )?src="a.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="b.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js" async(="async")?><\/script>)/,
      /(<link rel="prefetch" href="a.js" as="script"((>)|(\/>)|(><\/link>)))/,
      /(<link rel="preload" href="b.js" as="script"((>)|(\/>)|(><\/link>)))/
    ];
    expected.not.html = [
      /(<link rel="prefetch" href="c.js" as="script"((>)|(\/>)|(><\/link>)))/,
      /(<link rel="preload" href="a.js" as="script"((>)|(\/>)|(><\/link>)))/
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
      /(<script (type="text\/javascript" )?src="a.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="b.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?(src="c.js" defer(="defer")?)|(defer(="defer")? src="c.js")><\/script>)/,
      /(<link rel="prefetch" href="a.js" as="script"((>)|(\/>)|(><\/link>)))/,
      /(<link rel="preload" href="b.js" as="script"((>)|(\/>)|(><\/link>)))/,
      /(<link rel="prefetch" href="c.js" as="script"((>)|(\/>)|(><\/link>)))/
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
      /(<script (type="text\/javascript" )?src="\/subdomain\/a.js"><\/script>)/,
      /(<script (type="text\/javascript" )?src="\/subdomain\/b.js"><\/script>)/,
      /(<script (type="text\/javascript" )?src="\/subdomain\/c.js"><\/script>)/,
      /(<link rel="prefetch" href="\/subdomain\/a.js" as="script"((>)|(\/>)|(><\/link>)))/,
      /(<link rel="preload" href="\/subdomain\/b.js" as="script"((>)|(\/>)|(><\/link>)))/
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
      /(<script (type="text\/javascript" )?src="\/subdomain\/a.js"><\/script>)/,
      /(<script (type="text\/javascript" )?src="\/subdomain\/b.js"><\/script>)/,
      /(<script (type="text\/javascript" )?src="\/subdomain\/c.js"><\/script>)/,
      /(<link rel="prefetch" href="\/subdomain\/a.js" as="script"((>)|(\/>)|(><\/link>)))/,
      /(<link rel="preload" href="\/subdomain\/b.js" as="script"((>)|(\/>)|(><\/link>)))/
    ];
    testPlugin(config, expected, done);
  });

  it('adds a custom attribute to a single script', (done) => {
    const config = baseConfig(
      {
        custom: {
          test: /.js$/,
          attribute: 'customattribute'
        }
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script (type="text\/javascript" )?src="index_bundle.js" customattribute><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('adds a custom attribute with a value to a single script', (done) => {
    const config = baseConfig(
      {
        custom: {
          test: /.js$/,
          attribute: 'customattribute',
          value: 'xyz'
        }
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script (type="text\/javascript" )?src="index_bundle.js" customattribute="xyz"><\/script>)/
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
      /(<script (type="text\/javascript" )?src="a.js"><\/script>)/,
      /(<script nonce="abcde">)/,
      /(<script (type="text\/javascript" )?src="c.js"><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('multiple custom attributes over multiple scripts', (done) => {
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
      /(<script type="text\/paperscript" src="a.js" async wibble><\/script>)|(<script src="a.js" async wibble type="text\/paperscript"><\/script>)/,
      /(<script (type="text\/javascript" )?src="b.js" async(="async")?><\/script>)/,
      /(<script (type="text\/javascript" )?src="c.js" async wibble><\/script>)/
    ];
    testPlugin(config, expected, done);
  });

  it('custom attributes also added to prefetch resource hints', (done) => {
    const config = baseConfig(
      {
        custom: {
          test: /.js$/,
          attribute: 'customattribute',
          value: 'xyz'
        },
        prefetch: {
          test: /.js$/
        }
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script (type="text\/javascript" )?src="index_bundle.js" customattribute="xyz"><\/script>)/,
      /(<link rel="prefetch" href="index_bundle.js" as="script" customattribute="xyz"((>)|(\/>)|(><\/link>)))/
    ];
    testPlugin(config, expected, done);
  });
  it('custom attributes also added to preload resource hints', (done) => {
    const config = baseConfig(
      {
        custom: {
          test: /.js$/,
          attribute: 'customattribute',
          value: 'xyz'
        },
        preload: {
          test: /.js$/
        }
      },
      {},
      'index_bundle.js'
    );
    config.entry = path.join(__dirname, 'fixtures/script1.js');
    const expected = baseExpectations();
    expected.html = [
      /(<script (type="text\/javascript" )?src="index_bundle.js" customattribute="xyz"><\/script>)/,
      /(<link rel="preload" href="index_bundle.js" as="script" customattribute="xyz"((>)|(\/>)|(><\/link>)))/

    ];
    testPlugin(config, expected, done);
  });
});
