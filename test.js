var parser = require('./parser')
var compiler = require('./compiler')
var log = require('./log')

var jade = `
  section.foo#bar(data-foo="bar" quxx=beep boop) Testing. 1, 2, 3.
    div
      .bazz Fooooo
        | BAR

    span done.

`

var tree = parser(jade)
log(tree)
log(compiler.html(tree))

