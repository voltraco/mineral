var common = require('./common')
var mixins = {}

var IF_RE = /^\s*if\s*/
var EQ_RE = /^\s*=\s*/
var QUOTE_RE = /^"|'/

// determine if this is a path or just regular content
function getValue (data, str) {
  if (!EQ_RE.test(str)) return str
  var exp = str.replace(EQ_RE, '')
  return common.scopedExpression(data, exp)
}

function html (tree, data, location, cb) {
  if (!tree.children || !tree.children.length) return ''

  var findElseBranch = false

  return tree.children.map(function (child, index) {

    if (child.tagOrSymbol === 'else') {

      // if this is an "else if"
      if (IF_RE.test(child.content)) {
        var exp = child.content.replace(IF_RE, '')
        if (common.scopedExpression(data, exp)) {
          findElseBranch = false
          return html(child, data, location, cb)
        }
        return ''
      }

      if (!findElseBranch) return ''

      findElseBranch = false
      // regular else statement
      return html(child, data, location, cb)
    }

    // if we are searching for an else branch, forget everything else.
    if (findElseBranch) {
      if (index == tree.children.length - 1) throw new Error('missing else')
      return ''
    }

    if (child.tagOrSymbol === 'if') {
      if (common.scopedExpression(data, child.content)) {
        return html(child, data, location, cb)
      }
      findElseBranch = true
      return ''
    }

    if (child.tagOrSymbol === 'while') {
      var value = ''
      while (common.scopedExpression(data. child.content)) {
        value += html(child, data, location, cb)
      }
      return value
    }

    // treat all piped text as plain content.
    if (child.tagOrSymbol === '|') {
      return (' ' + getValue(data, child.content))
    }

    if (child.tagOrSymbol === '//') {
      return ''
    }

    // anything starting with a '+' is a function call.
    if (child.tagOrSymbol[0] === '+' && cb) {
      var name = child.tagOrSymbol.slice(1)
      if (!mixins[name]) throw new Error('Unknown mixin')
      return html(mixins[name], data, location, cb)
    }

    if (child.tagOrSymbol === 'mixin') {
      var name = child.content.split(/\s|\(/)[0]
      mixins[name] = child
      return ''
    }

    if (child.tagOrSymbol === 'include') {
      // pass location to the cb so inlcudes can be relative
      var resolved = cb({
        path: child.content,
        location: location
      })
      return html(resolved.tree, data, resolved.location, cb)
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
        if (!QUOTE_RE.test(value.trim())) {
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
      tag.push(html(child, data, location, cb))
    }

    // decide if the tag needs to be closed or not
    if (common.unclosed.indexOf(props.tagname) === -1) {
      tag.push('</', props.tagname, '>')
    }

    return tag.join('')
  }).join('')
}

module.exports = function (tree, data, location, cb) {
  cb = cb || common.resolveInclude
  return html(tree, data, location, cb)
}

