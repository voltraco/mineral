var CLASS_RE = /\.[^.]+/g
var ID_RE = /#[^. ]+/g

var closing = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]

function resolveTagOrSymbol (string) {
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

exports.html = function html (tree) {
  if (!tree.children || !tree.children.length) return ''

  return tree.children.map(function (child) {
    if (child.tagOrSymbol === '|') {
      return child.content
    }

    var props = resolveTagOrSymbol(child.tagOrSymbol)
    var tag = ['<', props.tagname]

    if (props.classname.length) {
      tag.push(' class="', props.classname, '"')
    }

    if (child.attributes) {
      var attrs = Object.keys(child.attributes).map(function (key) {
        return [key, '=', child.attributes[key]].join('')
      })
      if (attrs.length) tag.push(' ', attrs.join(' '))
    }

    tag.push('>') // html5 doesn't care about self closing tags

    if (child.content) {
      tag.push(child.content)
    }

    if (child.children.length) {
      tag.push(exports.html(child))
    }

    if (closing.indexOf(props.tagname) === -1) {
      tag.push('</', props.tagname, '>')
    }

    return tag.join('')

  }).join('')
}

exports.dom = function (tree) {

}

