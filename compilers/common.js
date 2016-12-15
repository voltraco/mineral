const fs = require('fs')
const fmt = require('util').format
const path = require('path')

const parse = require('../parser')

const CLASS_RE = /\.[^.]+/g
const ID_RE = /#[^. ]+/g

exports.unclosed = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'html',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'body',
  'doctype'
]

exports.resolveTagOrSymbol = function resolveTagOrSymbol (string) {
  const props = {
    tagname: 'div',
    classname: [],
    id: '',
    content: ''
  }

  string = string.replace(ID_RE, function (id) {
    props.id = id.slice(1)
    return ''
  })

  string = string.replace(CLASS_RE, function (cls) {
    props.classname.push(cls.slice(1))
    return ''
  })

  if (string) props.tagname = string
  props.classname = props.classname.join(' ')
  return props
}

exports.resolveInclude = function resolver (info, shouldParse) {
  let dirname = info.location || process.cwd()
  let stat = null

  try {
    stat = fs.statSync(info.location)
  } catch (_) {
  }

  if (stat && !stat.isDirectory()) {
    dirname = path.dirname(info.location)
  }

  const location = path.resolve(dirname, info.path)
  const text = fs.readFileSync(location, 'utf8')

  return {
    tree: shouldParse ? parse(text) : text,
    location: location
  }
}

exports.die = function die (info, name, message) {
  const msg = fmt('%s:%d:%d', message, info.column, info.lineno)
  const err = new Error(msg)
  err.name = name
  throw err
}

exports.scopedExpression = function scopedExpression (data, info, str) {
  const body = ['return ' + str + ';']
  const args = Object.keys(data).concat(body)
  const fn = Function.apply(null, args)
  const values = Object.keys(data).map(k => data[k])

  try {
    return fn.apply(data, values)
  } catch (ex) {
    exports.die(info, ex.name, ex.message)
  }
}

exports.each = function each(o, f) {
  const has = Object.prototype.hasOwnProperty
  if (Array.isArray(o)) {
    for (let i = 0; i < o.length; ++i) {
      f.call(null, o[i], i) }
  } else {
    for (let k in o) {
      if (has.call(o, k)) {
        f.call(null, o[k], k)
      }
    }
  }
}

