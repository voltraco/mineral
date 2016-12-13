const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))

const parse = require('../parser')
const compile = require('../compilers')

function readdirSync (p) {
  const files = fs.readdirSync(p)

  return [].concat.apply([], files.map(file => {
    let s = fs.statSync(path.join(p, file))
    if (s && s.isDirectory()) {
      return readdirSync(path.join(p, file))
    }
    if (/\.min$/.test(file)) {
      return path.join(p, file)
    }
  })).filter(v => !!v)
}

const sources = readdirSync(path.dirname(argv._[0]))
const data = argv.d || { quxx: 100, a: { val: 27 }, b: 50 }

const location = path.dirname(argv._[0])
const source = fs.readFileSync(argv._[0], 'utf8')
const html = compile.html(parse(source), data, location)

process.stdout.write(html)

