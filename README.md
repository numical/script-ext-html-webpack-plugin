Script Extension for HTML Webpack Plugin
========================================
[![npm version](https://badge.fury.io/js/script-ext-html-webpack-plugin.svg)](http://badge.fury.io/js/script-ext-html-webpack-plugin) [![Dependency Status](https://david-dm.org/numical/script-ext-html-webpack-plugin.svg)](https://david-dm.org/numical/script-ext-html-webpack-plugin) [![Build status](https://travis-ci.org/numical/script-ext-html-webpack-plugin.svg)](https://travis-ci.org/numical/script-ext-html-webpack-plugin) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

[![NPM](https://nodei.co/npm/script-ext-html-webpack-plugin.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/script-ext-html-webpack-plugin/)


Enhances [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
functionality with `async` and `defer` attributes for `<script>` elements. 

This is an extension plugin for the [webpack](http://webpack.github.io) plugin [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) - a plugin that simplifies the creation of HTML files to serve your webpack bundles.

The raw [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) creates all `<script>` elements as synchronous.  This plugin allows you to define which scripts should have the [async](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#Attributes) and [defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#Attributes) attributes.

Installation
------------
Install the plugin with npm:
```shell
$ npm install --save-dev script-ext-html-webpack-plugin
```

Basic Usage
-----------
Add the plugin to your webpack config as follows: 

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new ScriptExtHtmlWebpackPlugin()
]  
```
The above configuration will actually do nothing due to the configuration defaults. Some more useful scenarios:

All scripts set to `async`:
```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new ScriptExtHtmlWebpackPlugin({
    defaultAttribute: 'async'
  })
]  
```

All scripts set to `async` except 'first.js' which is sync:
```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new ScriptExtHtmlWebpackPlugin({
    sync: ['first.js'],
    defaultAttribute: 'async'
  })
]  
```

Configuration offers much more complex options:

Configuration
-------------
You must pass a hash of configuration options to the plugin to cause the addition of attributes:
- `sync`: array of `String`'s and/or `RegExp`'s defining script names that should have no attribute (default: `[]`);
- `async`: array of `String`'s and/or `RegExp`'s defining script names that should have an `async` attribute (default: `[]`);
- `defer`: array of `String`'s and/or `RegExp`'s defining script names that should have a `defer` attribute (default: `[]`);
- `defaultAttribute`: `'sync' | 'async' | 'defer'` The default attribute to set - `'sync'` actually results in no attribute (default: `'sync'`).

In the arrays a `String` value matches if it is a substring of the script name.

In more complicated use cases it may prove difficult to ensure that the pattern matching for different attributes are mutually exclusive.  To prevent confusion, the plugin operates a simple precedence model:

1. if a script name matches a `RegEx` or `String` from the `sync` option, it will have no attribute;

2. if a script name matches a `Regex` or `String` from the `async` option, it will have the `async` attribute, *unless* it matched condition 1;

3. if a script name matches a `Regex` or `String` from the `defer` option, it will have the `defer`
   attribute, *unless* it matched conditions 1 or 2;

4. if a script name does not match any of the previous conditions, it will have the `defaultAttribute' attribute.

Some Examples:

All scripts with 'important' in their name are sync and all others set to `defer`:
```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new ScriptExtHtmlWebpackPlugin({
    sync: ['important'],
    defaultAttribute: 'defer'
  })
]  
```

Alternatively, using a regular expression:
```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new ScriptExtHtmlWebpackPlugin({
    sync: [/important/],
    defaultAttribute: 'defer'
  })
]  
```

And so on, to craziness:
```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new ScriptExtHtmlWebpackPlugin({
    sync: [/imp(1|2){1,3}}/, 'initial'],
    defer: ['slow', /big.*andslow/],
    defaultAttribute: 'async'
  })
]  
```

Any problems with real-world examples, just raise an issue.  

