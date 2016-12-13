var parse = require('./parser')
var compile = require('./compilers')
var log = require('./log')
var fs = require('fs')
var path = require('path')

var jade = `

  .a
    .aa TXT
    .ab TXT
    /* cmt */
  .b =quxx
    .ba TXT
      | =quxx

  mixin Greeting()
    h1 Hello, World.

  include ./test/fixtures/a.min

  +Greeting
  +Greeting
`

var tree = parse(jade)
//log(tree)

var data = { quxx: 'FOO' }

var html = compile.html(tree, data, process.cwd())
process.stdout.write(html)

