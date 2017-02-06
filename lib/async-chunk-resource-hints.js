'use strict';

const CHUNK_OPTIONS = ['all', 'async'];

const matches = require('./common.js').matches;
const createResourceHint = require('./resource-hints.js').createResourceHint;

const addAsyncChunkResourceHints = (options, compilation) => {
  const getRef = generateRef(compilation.options);
  const hints = [];
  compilation.chunks
    .filter(chunk => !isInitial(chunk))
    .reduce(
      (files, chunk) => files.concat(chunk.files),
      [])
    .forEach(file => {
      if (optionsMatch(options.preload, file)) {
        hints.push(createResourceHint('preload', getRef(file)));
      } else if (optionsMatch(options.prefetch, file)) {
        hints.push(createResourceHint('prefetch', getRef(file)));
      }
    });
  return hints;
};

const isInitial = chunk => {
  return chunk.isInitial ? chunk.isInitial() : chunk.initial;
};

const optionsMatch = (option, file) => {
  return matches(option.chunks, CHUNK_OPTIONS) && matches(file, option.test);
};

const generateRef = options => {
  if (options.output && options.output.publicPath) {
    let prefix = options.output.publicPath;
    if (!prefix.endsWith('/')) {
      prefix = prefix + '/';
    }
    return file => prefix + file;
  } else {
    return file => file;
  }
};

module.exports = addAsyncChunkResourceHints;
