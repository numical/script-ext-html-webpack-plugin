/* eslint-env jasmine */
'use strict';

const WebpackConfig = require('webpack-config').default;
const ScriptExtHtmlWebpackPlugin = require('../index.js');
const normaliseOptions = require('../lib/config.js');
const DEFAULT_OPTIONS = normaliseOptions.DEFAULT_OPTIONS;

describe('Correctly understands all configuration permutations', () => {
  it('defaults all options if none passed', () => {
    expect(normaliseOptions()).toEqual(DEFAULT_OPTIONS);
  });

  it('defaults all options if null passed', () => {
    expect(normaliseOptions(null)).toEqual(DEFAULT_OPTIONS);
  });

  it('handles single default value', () => {
    const options = { defaultAttribute: 'async' };
    const expected = Object.assign({}, DEFAULT_OPTIONS, options);
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles single String pattern', () => {
    const options = { async: '*.js' };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      async: {
        test: ['*.js']
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles single Regex pattern', () => {
    const options = { inline: /\*.js$/ };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      inline: {
        test: [/\*.js$/]
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles Array of String and Regex patterns', () => {
    const options = { defer: ['*.js', /\*.js$/] };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      defer: {
        test: ['*.js', /\*.js$/]
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles hash configuration with single String for attribute', () => {
    const options = {
      module: {
        test: '*.js'
      }
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      module: {
        test: ['*.js']
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles full hash configuration for attribute', () => {
    const options = {
      module: {
        test: ['*.js', /\*.js$/]
      }
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      module: {
        test: ['*.js', /\*.js$/]
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles single Regex pattern for resource hint', () => {
    const options = { preload: /\*.js$/ };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      preload: {
        test: [/\*.js$/],
        chunks: 'initial'
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles Array of String and Regex patterns for resource hint', () => {
    const options = { prefetch: ['*.js', /\*.js$/] };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      prefetch: {
        test: ['*.js', /\*.js$/],
        chunks: 'initial'
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles partial hash configuration for resource hint', () => {
    const options = {
      preload: {
        test: ['*.js', /\*.js$/]
      }
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      preload: {
        test: ['*.js', /\*.js$/],
        chunks: 'initial'
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles full hash configuration with single string for resource hint', () => {
    const options = {
      preload: {
        test: '.js',
        chunks: 'all'
      }
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      preload: {
        test: ['.js'],
        chunks: 'all'
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles full hash configuration with array for resource hint', () => {
    const options = {
      preload: {
        test: ['.js', /\*.js$/],
        chunks: 'all'
      }
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      preload: {
        test: ['.js', /\*.js$/],
        chunks: 'all'
      }
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles single no value custom attribute', () => {
    const options = {
      custom: {
        test: '*.js',
        attribute: 'wibble'
      }
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      custom: [{
        test: ['*.js'],
        attribute: 'wibble',
        value: true
      }]
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles single custom attribute with a value', () => {
    const options = {
      custom: {
        test: '*.js',
        attribute: 'wibble',
        value: 'wobble'
      }
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      custom: [{
        test: ['*.js'],
        attribute: 'wibble',
        value: 'wobble'
      }]
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('handles multiple custom attributes', () => {
    const options = {
      custom: [
        {
          test: '*.js',
          attribute: 'wibble'
        },
        {
          test: 'a',
          attribute: 'wobble',
          value: 'xyz'
        },
        {
          test: 'b',
          attribute: 'warble',
          value: 'grunf'
        }
      ]
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      custom: [
        {
          test: ['*.js'],
          attribute: 'wibble',
          value: true
        },
        {
          test: ['a'],
          attribute: 'wobble',
          value: 'xyz'
        },
        {
          test: ['b'],
          attribute: 'warble',
          value: 'grunf'
        }

      ]
    });
    expect(normaliseOptions(options)).toEqual(expected);
  });

  it('works with webpack-config', () => {
    const config = new WebpackConfig().merge({
      plugins: [
        new ScriptExtHtmlWebpackPlugin({
          defaultAttribute: 'defer'
        })
      ]
    });

    expect(config.plugins[0].options.defaultAttribute).toEqual('defer');
  });
});
