var opath = require('object-path')

var CLASS_RE = /\.[^.]+/g
var ID_RE = /#[^. ]+/g

exports.closing = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]

exports.getValue = function (data, str) {
  var path = str.replace(/\s*=\s*/, '')
  return opath.get(data, path.trim())
}

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


