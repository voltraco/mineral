const common = require('./common')
const log = require('../log')
const mixins = {}

const IF_RE = /^\s*if\s*/
const IN_RE = /\s*in\s*/
const LINE_COMMENT_RE = /^\/\//
const EQ_RE = /^\s*=\s*/
const QUOTE_RE = /^"|'/

// determine if this is a path or just regular content
function getValue (data, info, str) {
  if (!EQ_RE.test(str)) return str
  const exp = str.replace(EQ_RE, '')
  return common.scopedExpression(data, info, exp)
}

function html (tree, data, location, cb) {
  let findElseBranch = false

  function compile(child, index) {
    //
    // first handle any flow control statements
    //
    if (child.tagOrSymbol === 'else') {
      // if this is an else-if
      if (IF_RE.test(child.content)) {
        const exp = child.content.replace(IF_RE, '')
        if (common.scopedExpression(data, child.pos, exp)) {
          findElseBranch = false
          return html(child, data, location, cb)
        }
        return ''
      }

      if (!findElseBranch) return ''

      findElseBranch = false
      return html(child, data, location, cb)
    }

    // if we are searching for an else branch, forget everything else.
    if (findElseBranch) {
      if (index == tree.children.length - 1) throw new Error('missing else')
      return ''
    }

    if (child.tagOrSymbol === 'if') {
      if (common.scopedExpression(data, child.pos, child.content)) {
        return html(child, data, location, cb)
      }
      findElseBranch = true
      return ''
    }

    if (child.tagOrSymbol === 'while') {
      let value = ''
      while (common.scopedExpression(data, child.pos, child.content)) {
        value += html(child, data, location, cb)
      }
      return value
    }

    if (child.tagOrSymbol === 'for') {
      const parts = child.content.split(IN_RE)
      const object = common.scopedExpression(data, child.pos, parts[1])
      let value = ''
      common.each(object, function (_value, key) {
        // create a new shallow scope so that locals dont persist
        const locals = { [parts[0]]: key }
        const scope = Object.assign({}, data, locals)
        value += html(child, scope, location, cb)
      })
      return value
    }

    // treat all piped text as plain content.
    if (child.tagOrSymbol === '|') {
      return (' ' + getValue(data, child.pos, child.content))
    }

    if (LINE_COMMENT_RE.test(child.tagOrSymbol)) {
      return ''
    }

    // anything prefixed with '+' is a mixin call.
    if (child.tagOrSymbol[0] === '+' && cb) {
      const name = child.tagOrSymbol.slice(1)
      if (!mixins[name]) {
        common.die(child.pos, 'TypeError', 'Unknown mixin')
      }
      return html(mixins[name], data, location, cb)
    }

    // defines a mixin
    if (child.tagOrSymbol === 'mixin') {
      const name = child.content.split(/\s|\(/)[0]
      mixins[name] = child
      return ''
    }

    if (child.tagOrSymbol === 'include') {
      // pass location to the cb so inlcudes can be relative
      const path = child.content
      const resolved = cb({ path, location })
      return html(resolved.tree, data, resolved.location, cb)
    }

    //
    // everything else is a tag
    //
    const props = common.resolveTagOrSymbol(child.tagOrSymbol)

    let tag = ['<', props.tagname]

    if (props.classname.length) {
      tag.push(' class="', props.classname, '"')
    }

    if (child.attributes) {
      const attrs = Object.keys(child.attributes).map(key => {
        let value = child.attributes[key]
        if (!QUOTE_RE.test(value.trim())) {
          value = getValue(data, child.pos, value)
        }
        return [key, '=', value].join('')
      })
      if (attrs.length) tag.push(' ', attrs.join(' '))
    }

    tag.push('>') // html5 doesn't care about self closing tags

    if (child.content) {
      tag.push(getValue(data, child.pos, child.content))
    }

    // nothing left to decide, recurse if there are child nodes
    if (child.children.length) {
      tag.push(html(child, data, location, cb))
    }

    // decide if the tag needs to be closed or not
    if (common.unclosed.indexOf(props.tagname) === -1) {
      tag.push('</', props.tagname, '>')
    }

    return tag.join('')
  }

  if (tree.children && tree.children.length) {
    return tree.children.map(compile).join('')
  }
  return ''
}

module.exports = function (tree, data, location, cb) {
  cb = cb || common.resolveInclude
  return html(tree, data, location, cb)
}

