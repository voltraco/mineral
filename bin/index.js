const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const mkdirp = require('mkdirp')
const chokidar = require('chokidar')
const chalk = require('chalk')

const compiler = require('../compilers/html')
const parse = require('../parser')
const readdirSync = require('./readdirsync')

const argv = minimist(process.argv.slice(2))

if (argv.h) {
  console.log(`
    Usage:
      min FILE1, ... [options]

    Options:
      -w           Watch for changes and recompile
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

const deps = {}
const recent = []

const log = (symbol, event, s, ...args) => {
  const msg = [chalk.white(symbol), chalk.blue(event), s]
  console.log(msg.join(' '), ...args)
}

// TODO: get a pre-cache all mixins

function compile (file) {

  const original = file
  if (deps[file]) file = deps[file]

  file = path.resolve(file)
  const location = path.dirname(file)
  const source = fs.readFileSync(file, 'utf8')
  const tree = parse(source)
  const html = compiler(tree, data, file)

  if (!argv.o) {
    process.stdout.write(html + '\n')
  } else {
    const out = path.join(
      path.resolve(location),
      path.relative(location, argv.o)
    )
    mkdirp.sync(out)
    try {
      file = file.replace(/\.min$/, '.html')
      const dest = path.join(out, path.basename(file))
      fs.writeFileSync(dest, html)
      log(' ✓ ', 'compiled', original)
    } catch (ex) {
      console.error(ex)
      process.exit(1)
    }
  }
}
const files = argv._

files.map(compile)

if (argv.w) {

  global.watcher = chokidar
    .watch(files, { persistent: true, atomic: true })
    .on('add', path => compile(path))
    .on('change', path => compile(path))
    .on('unlink', path => compile(path))
    .on('addDir', path => compile(path))
    .on('unlinkDir', path => compile(path))

  global.addToWatcher = (origin, p) => {
    const target = path.resolve(path.dirname(origin), p)
    if (deps[target]) return

    deps[target] = origin
    watcher.add(target)
    log(' · ', 'watching', '%s -> %s', origin, target)
  }

  function onReady() {
    const watched = watcher.getWatched()
    Object.keys(watched).map(p => watched[p].map(f => {
      const target = path.join(p, f)
      log(' · ', 'watching', target)
    }))
  }

  global.watcher.on('ready', onReady)
}
