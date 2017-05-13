'use strict';

const CHUNK_OPTIONS = ['all', 'async'];

const getPublicPath = require('./common.js').getPublicPath;
const createResourceHint = require('./resource-hints.js').createResourceHint;
const matches = require('./common.js').matches;

const addAsyncChunkResourceHints = (chunks, options) => {
  const getRef = generateRef(options);
  const hints = [];
  chunks
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
  const publicPath = getPublicPath(options);
  if (publicPath) {
    const prefix = publicPath.endsWith('/') ? publicPath : publicPath + '/';
    return file => prefix + file;
  } else {
    return file => file;
  }
};

module.exports = addAsyncChunkResourceHints;
