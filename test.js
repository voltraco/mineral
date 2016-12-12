var parser = require('./parser')
var compiler = require('./compilers')
var log = require('./log')

var jade = `

  .a
    .aa TXT
    .ab TXT
    /* cmt */
  .b =quxx
    .ba TXT
      | =quxx
`

var tree = parser(jade)
//log(tree)

function resolver (tag) {
  console.log(tag.tagname)
  console.log(tag.content)
  return 'x'
}

log(tree)
var data = { quxx: 'FOO' }
console.log(compiler.html(tree, data, resolver))

