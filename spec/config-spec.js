/* eslint-env jasmine */
'use strict';

const denormaliseOptions = require('../lib/config.js');
const DEFAULT_OPTIONS = denormaliseOptions.DEFAULT_OPTIONS;

describe('Correctly understands all configuration permutations', () => {
  it('defaults all options if none passed', () => {
    expect(denormaliseOptions()).toEqual(DEFAULT_OPTIONS);
  });

  it('defaults all options if null passed', () => {
    expect(denormaliseOptions(null)).toEqual(DEFAULT_OPTIONS);
  });

  it('handles single default value', () => {
    const options = {defaultAttribute: 'async'};
    const expected = Object.assign({}, DEFAULT_OPTIONS, options);
    expect(denormaliseOptions(options)).toEqual(expected);
  });

  it('handles single String pattern', () => {
    const options = {async: '*.js'};
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      async: {
        test: ['*.js']
      }
    });
    expect(denormaliseOptions(options)).toEqual(expected);
  });

  it('handles single Regex pattern', () => {
    const options = {inline: /\*.js$/};
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      inline: {
        test: [/\*.js$/]
      }
    });
    expect(denormaliseOptions(options)).toEqual(expected);
  });

  it('handles Array of String and Regex patterns', () => {
    const options = {defer: ['*.js', /\*.js$/]};
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      defer: {
        test: ['*.js', /\*.js$/]
      }
    });
    expect(denormaliseOptions(options)).toEqual(expected);
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
    expect(denormaliseOptions(options)).toEqual(expected);
  });

  it('handles single Regex patterni for resource hint', () => {
    const options = {preload: /\*.js$/};
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      preload: {
        test: [/\*.js$/],
        chunks: 'initial'
      }
    });
    expect(denormaliseOptions(options)).toEqual(expected);
  });

  it('handles Array of String and Regex patterns for resource hint', () => {
    const options = {prefetch: ['*.js', /\*.js$/]};
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      prefetch: {
        test: ['*.js', /\*.js$/],
        chunks: 'initial'
      }
    });
    expect(denormaliseOptions(options)).toEqual(expected);
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
    expect(denormaliseOptions(options)).toEqual(expected);
  });

  it('handles partial (incorect) hash configuration for resource hint', () => {
    const options = {
      prefetch: {
        chunks: 'all'
      }
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      prefetch: {
        test: [],
        chunks: 'all'
      }
    });
    expect(denormaliseOptions(options)).toEqual(expected);
  });

  it('handles full hash configuration for resource hint', () => {
    const options = {
      preload: {
        test: ['*.js', /\*.js$/],
        chunks: 'all'
      }
    };
    const expected = Object.assign({}, DEFAULT_OPTIONS, {
      preload: {
        test: ['*.js', /\*.js$/],
        chunks: 'all'
      }
    });
    expect(denormaliseOptions(options)).toEqual(expected);
  });
});
