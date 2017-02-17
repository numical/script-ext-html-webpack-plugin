'use strict';

const hasNonDefaultPositionProperty = property => {
  return typeof property === 'object' &&
    property.hasOwnProperty('position') &&
    property['position'] !== 'plugin';
};

const shouldSort = (options) => {
  return (options.defaultPosition === 'plugin')
    ? Object.keys(options).some(key => hasNonDefaultPositionProperty(options[key]))
    : true;
};

const sort = (options, pluginArgs) => {
  const sortedTags = {
    'head-top': [],
    'head': [],
    'head-bottom': [],
    'body-top': [],
    'body': [],
    'body-bottom': []
  };
  // sort tags
  const headTagPositionsByType = tagPositionsByType(options, 'head');
  pluginArgs.head.forEach(tag => {
    sortedTags[headTagPositionsByType[typeOfTag(tag)]].push(tag);
  });
  const bodyTagPositionsByType = tagPositionsByType(options, 'body');
  pluginArgs.body.forEach(tag => {
    sortedTags[bodyTagPositionsByType[typeOfTag(tag)]].push(tag);
  });
  // return to plugin args, now sorted
  pluginArgs.head = sortedTags['head-top'].concat(sortedTags['head']).concat(sortedTags['head-bottom']);
  pluginArgs.body = sortedTags['body-top'].concat(sortedTags['body']).concat(sortedTags['body-bottom']);
};

const tagPositionsByType = (options, defaultTagPosition) => {
  const defaultPosition = (options.defaultPosition === 'plugin') ? defaultTagPosition : options.defaultPosition;
  return {
    inline: options.inline.position || defaultPosition,
    sync: options.sync.position || defaultPosition,
    async: options.async.position || defaultPosition,
    defer: options.defer.position || defaultPosition,
    module: options.module.position || defaultPosition,
    prefetch: options.prefetch.position || defaultPosition,
    preload: options.preload.position || defaultPosition,
    other: defaultTagPosition
  };
};

const typeOfTag = tag => {
  switch (tag.tagName) {
    case 'script':
      if (tag.innnerHTML) {
        return 'inline';
      } else if (getAttribute(tag, 'type') === 'module') {
        return 'module';
      } else if (hasAttribute(tag, 'async')) {
        return 'async';
      } else if (hasAttribute(tag, 'defer')) {
        return 'defer';
      } else {
        return 'sync';
      }
    case 'link':
      switch (getAttribute(tag, 'rel')) {
        case 'prefetch':
          return 'prefetch';
        case 'preload':
          return 'preload';
        default:
          return 'other';
      }
    default:
      return 'other';
  }
};

const getAttribute = (tag, attribute) => (tag.attributes) ? tag.attributes.attribute : null;

const hasAttribute = (tag, attribute) => tag.attributes && tag.attributes.hasOwnProperty(attribute);

module.exports = {
  shouldSort,
  sort
};
