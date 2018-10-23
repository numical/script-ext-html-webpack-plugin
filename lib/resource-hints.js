'use strict';

const shouldAddResourceHints = options => {
  return !(options.prefetch.test.length === 0 &&
           options.preload.test.length === 0);
};

const createResourceHint = (rel, href, attrs) => {
  return {
    tagName: 'link',
    selfClosingTag: true,
    attributes: Object.assign({}, attrs, {
      rel: rel,
      href: href,
      as: 'script'
    })
  };
};

module.exports = {
  shouldAddResourceHints,
  createResourceHint
};
