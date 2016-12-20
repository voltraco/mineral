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

const log = (event, s, ...args) => {
  const msg = ['  ', chalk.blue(event), s]
  console.log(msg.join(' '), ...args)
}

function trunc (s) {
  const parts = s.split('/')
  if (parts.length > 3) return s.replace(process.cwd(), '').slice(1)
  return s
}

function findCommonPath () {
  if (argv._.length === 1) {
    return path.dirname(first)
  }

  const first = argv._[0].split(path.sep)
  const second = argv._[1].split(path.sep)
  let buf = []

  first.some((seg, i) => {
    const match = first[i] === second[i]
    if (match) buf.push(seg)
    return !match
  })
  return path.resolve(path.join(...buf))
}

const common = findCommonPath()

function compileFile (file) {

  if (deps[file]) file = deps[file]

  const sourcepath = path.resolve(file)
  const sourcetree = fs.readFileSync(sourcepath, 'utf8')
  const html = compile(parse(sourcetree), data, sourcepath)

  if (!argv.o) {
    return process.stdout.write(html + '\n')
  }

  const out = path.join(
    path.resolve(argv.o),
    path.dirname(sourcepath.replace(common, ''))
  )

  mkdirp.sync(out)

  try {
    const destfile = sourcepath.replace(/\.min$/, '.html')
    const target = path.join(out, path.basename(destfile))
    fs.writeFileSync(target, html)
    log('compiled', trunc(destfile))
  } catch (ex) {
    console.error(ex)
    process.exit(1)
  }
}

argv._.forEach(compileFile)

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
    log('watching', '%s -> %s', trunc(origin), trunc(target))
  }

  function onReady() {
    const watched = watcher.getWatched()
    Object.keys(watched).map(p => watched[p].map(f => {
      const target = path.join(p, f)
      log('watching', trunc(target))
    }))
  }

  global.watcher.on('ready', onReady)
}
