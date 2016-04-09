Script Extension for HTML Webpack Plugin
========================================
Enhances [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
functionality with `async` and `defer` attributes for `<script>` elements. 

This is an extension plugin for the [webpack](http://webpack.github.io) plugin [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) - a plugin that simplifies the creation of HTML files to serve your webpack bundles.

The raw [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin) creates all `<script>` elements as synchronous.  This plugin allows you to define which scripts should have the [async](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#Attributes) and [defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#Attributes) attributes.

Installation
------------
Install the plugin with npm:
```shell
$ npm install --save-dev numical/script-ext-html-webpack-plugin
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

Configuration
-------------
The above configuration will actually do nothing due to the configuration defaults.
You must pass a hash of configuration options to the plugin to cause the addition of attributes:
- `sync`: array of `String`'s and/or `RegExp`'s defining scripts that should have no
attribute.  Default value of the option is an empty array.
- `async`: array of `String`'s and/or `RegExp`'s defining scripts that should have an `async` attribute.  Default value of the option is an empty array.
- `defer`: array of `String`'s and/or `RegExp`'s defining scripts that should have a `defer` attribute.  Default value of the option is an empty array.
- `defaultAttribute`: `'sync' | 'async' | 'defer'` The default attribute to set - `'sync'` actually results in no attribute. Default value of the option is `'sync'`.

In more complicated use cases it may prove difficult to ensure that the pattern matching for different attributes are mutually exclusive.  To prevent confusion, the plugin operates a simple precedence model:
1. if a script name matches a `RegEx` or `String` from the `sync` option, it will have no attribute;
2. if a script name matches a `Regex` or `String` from the `async` option, it will have the `async` attribute, *unless* it matched condition 1;
3. if a script name matches a `Regex` or `String` from the `defer` option, it will have the `defer`
   attribute, *unless* it matched conditions 1 or 2;
4. if a script name does not match any of the previous conditions, it will have the `defaultAttribute' attribute.

Some examples:

All scripts set to `async`:
```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new ScriptExtHtmlWebpackPlugin({
    defaultAttribute: 'async'
  })
]  
```


