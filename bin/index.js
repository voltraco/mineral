const fs = require('fs')
const path = require('path')
const minimist = require('minimist')
const mkdirp = require('mkdirp')
const chokidar = require('chokidar')
const chalk = require('chalk')

const compile = require('../compilers/html')
const parse = require('../parser')
const readdirSync = require('./readdirsync')

const argv = minimist(process.argv.slice(2))

// TODO: get a pre-cache all mixins

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

function trunc (s) {
  const parts = s.split('/')
  if (parts.length > 3) return s.replace(process.cwd(), '').slice(1)
  return s
}

function compileFile (file) {

  if (deps[file]) file = deps[file]

  const sourcefile = path.resolve(file)
  const source = fs.readFileSync(sourcefile, 'utf8')
  // console.log(require('util').inspect(parse(source), { colors: true, depth: null }))
  const html = compile(parse(source), data, sourcefile)

  if (!argv.o) {
    return process.stdout.write(html + '\n')
  }

  const outdir = path.dirname(sourcefile)

  const out = path.join(
    path.resolve(outdir),
    path.relative(outdir, argv.o)
  )

  mkdirp.sync(out)

  try {
    const destfile = sourcefile.replace(/\.min$/, '.html')
    const target = path.join(out, path.basename(destfile))
    fs.writeFileSync(target, html)
    log(' ✓ ', 'compiled', trunc(file))
  } catch (ex) {
    console.error(ex)
    process.exit(1)
  }
}

argv._.map(compileFile)

if (argv.w) {

  global.watcher = chokidar
    .watch(argv._, { persistent: true, atomic: true })
    .on('add', path => compileFile(path))
    .on('change', path => compileFile(path))
    .on('unlink', path => compileFile(path))
    .on('addDir', path => compileFile(path))
    .on('unlinkDir', path => compileFile(path))

  global.addToWatcher = (origin, p) => {
    const target = path.resolve(path.dirname(origin), p)
    if (deps[target]) return

    deps[target] = origin
    watcher.add(target)
    log(' · ', 'watching', '%s -> %s', trunc(origin), trunc(target))
  }

  function onReady() {
    const watched = watcher.getWatched()
    Object.keys(watched).map(p => watched[p].map(f => {
      const target = path.join(p, f)
      log(' · ', 'watching', trunc(target))
    }))
  }

  global.watcher.on('ready', onReady)
}
