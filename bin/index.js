const fs = require('fs')
const path = require('path')

const parse = require('../parser')
const compile = require('../compilers')

// find all *.min
// add to global object
// replace `+footer` with the content from footer.mixin.min

function readdirSync (p) {
  const files = fs.readdirSync(p)

  return [].concat.apply([], files.map(file => {
    let s = fs.statSync(path.join(p, file))
    if (s.isDirectory()) {
      return readdirSync(path.join(p, file))
    }
    if (/\.min$/.test(file)) {
      return path.join(p, file)
    }
  })).filter(v => !!v)
}

const sources = readdirSync(process.argv[2])
const data = (process.argv[3] && require(process.argv[3])) || {}

function resolver (tag) {
  console.log(tag.tagname)
  console.log(tag.content)
  return 'x'
}

const tree = parse(source)
const html = compile.html(tree, data, resolver)

process.stdout.write(html)

