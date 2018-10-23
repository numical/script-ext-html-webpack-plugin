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
        hints.push(createResourceHint('preload', getRef(file), options.preload.attrs));
      } else if (optionsMatch(options.prefetch, file)) {
        hints.push(createResourceHint('prefetch', getRef(file), options.prefetch.attrs));
      }
    });
  return hints;
};

const isInitial = chunk =>
  chunk.canBeInitial
    ? chunk.canBeInitial()
    : chunk.isInitial
      ? chunk.isInitial()
      : chunk.isInitial;

const optionsMatch = (option, file) => {
  return matches(option.chunks, CHUNK_OPTIONS) && matches(file, option.test);
};

const generateRef = options => {
  const publicPath = getPublicPath(options);
  return publicPath
    ? file => publicPath + file
    : file => file;
};

module.exports = addAsyncChunkResourceHints;
