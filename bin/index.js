const fs = require('fs')
const path = require('path')
const log = require('../log')
const argv = require('minimist')(process.argv.slice(2))
const mkdirp = require('mkdirp')

const parse = require('../parser')
const readdirSync = require('./readdirsync')

const compilers = {}
compilers.html = require('../compilers/html')
compilers.dom = require('../compilers/dom')

if (argv.h) {
  console.log(`
    Usage:
      min FILE1, ... [options]

    Options:
      -o DIR       Output directory
      -d '...'     A string of JSON, used as locals
      --data FILE  A path to a JSON file to use as locals
  `)

  process.exit(0)
}

let data = {}

if (argv.d) {
  try {
    data = JSON.parse(argv.d)
  } catch (ex) {
    console.error('Unable to parse data')
    process.exit(1)
  }
} else if (argv.data) {
  try {
    data = require(path.resolve(argv.data))
  } catch (ex) {
    console.error('Unable to read file')
    process.exit(1)
  }
}

// TODO: get a pre-cache all mixins
//const sources = readdirSync(path.dirname(argv._[0]))

argv._.map(file => {
  const location = path.dirname(file)
  const source = fs.readFileSync(file, 'utf8')
  const tree = parse(source)
  const html = compilers.html(tree, data, location)

  if (!argv.o) {
    process.stdout.write(html + '\n')
  } else {
    var out = path.join(
      path.resolve(location),
      path.relative(location, argv.o)
    )
    mkdirp.sync(out)
    try {
      file = file.replace(/\.min$/, '.html')
      fs.writeFileSync(path.join(out, path.basename(file)), html)
    } catch (ex) {
      console.error(ex)
      process.exit(1)
    }
  }
})

