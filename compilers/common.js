//var opath = require('object-path')
var fs = require('fs')
var path = require('path')

var parse = require('../parser')

var CLASS_RE = /\.[^.]+/g
var ID_RE = /#[^. ]+/g

exports.unclosed = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'html',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'body',
  'doctype'
]

//exports.getValue = function (data, str) {
//  var path = str.replace(/\s*=\s*/, '')
//  return opath.get(data, path.trim()) || ''
//}

exports.resolveTagOrSymbol = function resolveTagOrSymbol (string) {
  var props = {
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

exports.resolveInclude = function resolver (info) {
  var dirname = info.location || process.cwd()
  var stat = null

  try {
    stat = fs.statSync(info.location)
  } catch (_) {
  }

  if (stat && !stat.isDirectory()) {
    dirname = path.dirname(info.location)
  }

  var location = path.resolve(dirname, info.path)
  var text = fs.readFileSync(location, 'utf8')

  return {
    tree: parse(text),
    location: location
  }
}

exports.scopedExpression = function scopedExpression (data, str) {
  var body = ['return ' + str + ';']
  var args = Object.keys(data).concat(body)
  var fn = Function.apply(null, args)
  var values = Object.keys(data).map(function (k) {
    return data[k]
  })
  return fn.apply(data, values)
}

