/* eslint-env jasmine */
'use strict';

const path = require('path');
const deleteDir = require('rimraf');
const version = require('./helpers/versions.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('../index.js');
const testPlugin = require('./helpers/core-test.js');

const OUTPUT_DIR = path.join(__dirname, '../dist');

const baseConfig = (scriptExtOptions) => {
  const config = {
    entry: path.join(__dirname, 'fixtures/async_script.js'),
    output: {
      path: OUTPUT_DIR,
      filename: 'index_bundle.js',
      chunkFilename: 'async-chunk[id].js'
    },
    plugins: [
      new HtmlWebpackPlugin(),
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
  files: expectedFiles(),
  not: {
    html: [],
    js: [],
    files: []
  }
});

const expectedFiles = () => {
  return version.major === 1
    ? [
      'index.html',
      'index_bundle.js',
      'async-chunk1.js',
      'async-chunk2.js'
    ]
    : [
      'index.html',
      'index_bundle.js',
      'async-chunk0.js',
      'async-chunk1.js'
    ];
};

describe(`Async functionality (webpack ${version.display})`, function () {
  beforeEach((done) => {
    deleteDir(OUTPUT_DIR, done);
  });

  it('adds async chunks to preload', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        preload: {
          test: /\.js$/,
          chunks: 'async'
        }
      }
    );
    const expected = baseExpectations();
    if (version.major === 1) {
      expected.html = [
        /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="preload" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="async-chunk2.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    } else {
      expected.html = [
        /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="preload" href="async-chunk0.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    }
    testPlugin(config, expected, done);
  });

  it('adds async chunks to prefetch', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        prefetch: {
          test: /\.js$/,
          chunks: 'async'
        }
      }
    );
    const expected = baseExpectations();
    if (version.major === 1) {
      expected.html = [
        /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="prefetch" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="prefetch" href="async-chunk2.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    } else {
      expected.html = [
        /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="prefetch" href="async-chunk0.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="prefetch" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    }
    testPlugin(config, expected, done);
  });

  it('adds selected sync chunks to prefetch', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        prefetch: {
          test: ['1'],
          chunks: 'async'
        }
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/,
      /(<link rel="prefetch" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/
    ];
    if (version.major === 1) {
      expected.not.html = [
        /(<link rel="prefetch" href="async-chunk0.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    } else {
      expected.not.html = [
        /(<link rel="prefetch" href="async-chunk0.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    }
    testPlugin(config, expected, done);
  });

  it('adds async preload chunks ahead of async prefetch', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        prefetch: {
          test: /\.js$/,
          chunks: 'async'
        },
        preload: {
          test: '1',
          chunks: 'async'
        }
      }
    );
    const expected = baseExpectations();
    if (version.major === 1) {
      expected.html = [
        /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="preload" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="prefetch" href="async-chunk2.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    } else {
      expected.html = [
        /(<script (type="text\/javascript" )?src="index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="prefetch" href="async-chunk0.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    }
    testPlugin(config, expected, done);
  });

  it('adds async and initial chunks to preload', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'defer',
        preload: {
          test: /\.js$/,
          chunks: 'all'
        }
      }
    );
    const expected = baseExpectations();
    if (version.major === 1) {
      expected.html = [
        /(<script (type="text\/javascript" )?(src="index_bundle.js" defer(="defer")?)|(defer(="defer")? src="index_bundle.js")><\/script>)/,
        /(<link rel="preload" href="index_bundle.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="async-chunk2.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    } else {
      expected.html = [
        /(<script (type="text\/javascript" )?(src="index_bundle.js" defer(="defer")?)|(defer(="defer")? src="index_bundle.js")><\/script>)/,
        /(<link rel="preload" href="index_bundle.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="async-chunk0.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    }
    testPlugin(config, expected, done);
  });

  it('adds only initial chunks to prefetch', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'defer',
        preload: {
          test: /\.js$/,
          chunks: 'initial'
        }
      }
    );
    const expected = baseExpectations();
    expected.html = [
      /(<script (type="text\/javascript" )?(src="index_bundle.js" defer(="defer")?)|(defer(="defer")? src="index_bundle.js")><\/script>)/,
      /(<link rel="preload" href="index_bundle.js" as="script"((>)|(\/>)|(><\/link>)))/
    ];
    if (version.major === 1) {
      expected.not.html = [
        /(<link rel="preload" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="async-chunk2.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    } else {
      expected.not.html = [
        /(<link rel="preload" href="async-chunk0.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    }
    testPlugin(config, expected, done);
  });

  it('async chunks cope with public path', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        preload: {
          test: /\.js$/,
          chunks: 'async'
        }
      }
    );
    config.output.publicPath = '/subdomain/';
    const expected = baseExpectations();
    if (version.major === 1) {
      expected.html = [
        /(<script (type="text\/javascript" )?src="\/subdomain\/index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="preload" href="\/subdomain\/async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="\/subdomain\/async-chunk2.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    } else {
      expected.html = [
        /(<script (type="text\/javascript" )?src="\/subdomain\/index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="preload" href="\/subdomain\/async-chunk0.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="\/subdomain\/async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    }
    testPlugin(config, expected, done);
  });

  it('all chunks cope with public path (no ending forward slash)', (done) => {
    const config = baseConfig(
      {
        defaultAttribute: 'async',
        preload: {
          test: 'js',
          chunks: 'all'
        }
      }
    );
    config.output.publicPath = '/subdomain';
    const expected = baseExpectations();
    if (version.major === 1) {
      expected.html = [
        /(<script (type="text\/javascript" )?src="\/subdomain\/index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="preload" href="\/subdomain\/index_bundle.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="\/subdomain\/async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="\/subdomain\/async-chunk2.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    } else {
      expected.html = [
        /(<script (type="text\/javascript" )?src="\/subdomain\/index_bundle.js" async(="async")?><\/script>)/,
        /(<link rel="preload" href="\/subdomain\/index_bundle.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="\/subdomain\/async-chunk0.js" as="script"((>)|(\/>)|(><\/link>)))/,
        /(<link rel="preload" href="\/subdomain\/async-chunk1.js" as="script"((>)|(\/>)|(><\/link>)))/
      ];
    }
    testPlugin(config, expected, done);
  });
});
