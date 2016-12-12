var common = require('./common')

function getValue (data, str) {
  // determine if this is a path or just regular content
  if (!/^\s*=\s*/.test(str)) return str
  return common.getValue(data, str)
}

function html (tree, data, cb) {
  if (!tree.children || !tree.children.length) return ''

  return tree.children.map(function (child) {
    // treat all piped text as plain content.
    if (child.tagOrSymbol === '|') {
      return (' ' + getValue(data, child.content))
    }

    // anything starting with a '+' is a function call.
    if (child.tagOrSymbol[0] === '+' && cb) {
      return cb({
        tagname: child.tagOrSymbol.slice(1),
        attributes: child.attributes,
        id: child.id,
        content: child.content,
        classname: child.classname
      })
    }

    // everything else is a tag or a flow control statement.
    var props = common.resolveTagOrSymbol(child.tagOrSymbol)

    if (props.tagname === 'if') {
    }

    var tag = ['<', props.tagname]

    if (props.classname.length) {
      tag.push(' class="', props.classname, '"')
    }

    if (child.attributes) {
      var attrs = Object.keys(child.attributes).map(function (key) {
        var value = child.attributes[key]
        if (!/^"|'/.test(value.trim())) {
          value = getValue(data, value)
        }
        return [key, '=', value].join('')
      })
      if (attrs.length) tag.push(' ', attrs.join(' '))
    }

    tag.push('>') // html5 doesn't care about self closing tags

    if (child.content) {
      tag.push(getValue(data, child.content))
    }

    // recurse
    if (child.children.length) {
      tag.push(html(child, data, cb))
    }

    // close tags that needs to be closed.
    if (common.closing.indexOf(props.tagname) === -1) {
      tag.push('</', props.tagname, '>')
    }

    return tag.join('')
  }).join('')
}

module.exports = function (tree, data, cb) {
  return html(tree, data, cb)
}

