ABOUT
Mineral is a language that compiles to markup or dom. It's similar to Jade (aka
Pug). Its goal is to be much smaller and simpler than pug, and integrate well
with modern client side frameworks.

DOCS
http://voltraco.github.io/mineral/

INSTALL
npm i mineral

CLI
Watch and compile mineral files https://github.com/voltraco/mineral-cli

WEBPACK
Use https://github.com/voltraco/mineral-loader to read mineral files and parse
them into trees. This is easy, just `require('./file.min')`.

BROWSERIFY
For browserify, use the individual components.

const tree = require('mineral/parser')(string)
const el = require('mineral/compilers/dom')(tree)

