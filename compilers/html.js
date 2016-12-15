const transformer = require('jstransformer')
const common = require('./common')
const log = require('../log')
const fmt = require('util').format
const mixins = {}

const IF_RE = /^\s*if\s*/
const IN_RE = /\s*in\s*/
const LINE_COMMENT_RE = /^\/\//
const FMT_RE = /["'](.*?)["'], /
const MIN_FILE_RE = /\.min$/
const EQ_RE = /^\s*=\s*/
const QUOTE_RE = /^"|'/

const COLON = 58
const PLUS = 43
const A = 65
const Z = 90

// determine if this is a path or just regular content

function html (tree, data, location, cb) {
  let findElseBranch = false
  let logical = false

  function getValue (data, info, str) {
    if (!EQ_RE.test(str)) return str
    let exp = str.replace(EQ_RE, '')
    if (FMT_RE.test(exp)) exp = 'fmt(' + exp + ')'
    logical = true
    return common.scopedExpression(data, info, exp)
  }

  function compile(child, index) {
    if (child.html) return child.html

    const firstLetter = child.tagOrSymbol.charCodeAt(0)
    //
    // first handle any flow control statements
    //
    if (child.tagOrSymbol === 'else') {
      logical = true
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
      logical = true
      if (common.scopedExpression(data, child.pos, child.content)) {
        return html(child, data, location, cb)
      }
      findElseBranch = true
      return ''
    }

    if (child.tagOrSymbol === 'while') {
      logical = true
      let value = ''
      while (common.scopedExpression(data, child.pos, child.content)) {
        value += html(child, data, location, cb)
      }
      return value
    }

    if (child.tagOrSymbol === 'for') {
      logical = true
      const parts = child.content.split(IN_RE)
      const object = common.scopedExpression(data, child.pos, parts[1])
      let value = ''
      common.each(object, function (_value, key) {
        // create a new shallow scope so that locals don't persist
        const locals = { [parts[0]]: key }
        const scope = Object.assign({}, data, locals)
        value += html(child, scope, location, cb)
      })
      return value
    }

    if (child.tagOrSymbol === 'each') {
      common.die(child.pos, 'TypeError', 'Each not supported (use for)')
    }

    // treat all piped text as plain content
    if (child.tagOrSymbol === '|') {
      return (' ' + getValue(data, child.pos, child.content))
    }

    if (LINE_COMMENT_RE.test(child.tagOrSymbol)) {
      return ''
    }

    if (firstLetter === COLON) {
      const name = 'jstransformer-' + child.tagOrSymbol.slice(1)
      let t = null
      try {
        t = transformer(require(name))
      } catch (ex) {
        common.die(child.pos, 'Error', fmt('%s not installed', name))
      }
      const path = child.content
      const data = cb({ path, location })
      const parsed = t.render(data.tree, child.attributes)
      return parsed.body
    }

    // anything prefixed with '+' is a mixin call.
    if (firstLetter === PLUS && cb) {
      logical = true
      const name = child.tagOrSymbol.slice(1)
      if (!mixins[name]) {
        common.die(child.pos, 'TypeError', 'Unknown mixin')
      }

      const locals = {}
      const args = Object.keys(child.attributes).map(attr => {
        return common.scopedExpression(data, child.pos, attr)
      })

      mixins[name].keys.map((k, index) => (locals[k] = args[index]))
      const scope = Object.assign({}, data, locals)
      return html(mixins[name].child, scope, location, cb)
    }

    // defines a mixin
    if (firstLetter >= A && firstLetter <= Z) {
      logical = true
      const keys = Object.keys(child.attributes)
      mixins[child.tagOrSymbol] = { child, keys }
      return ''
    }

    if (child.tagOrSymbol === 'include') {
      // pass location to the cb so inlcudes can be relative
      logical = true
      const path = child.content

      // if the include is not a .min extension, it's plain text
      if (MIN_FILE_RE.test(location)) {
        const resolved = cb({ path, location }, true)
        return html(resolved.tree, data, resolved.location, cb)
      }
      return cb({ path, location })
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

    var s = tag.join('')
    // if this is not a logical node, we can make an optimization
    if (!logical) child.html = s
    return s
  }

  if (tree.children && tree.children.length) {
    return tree.children.map(compile).join('')
  }
  return ''
}

module.exports = function (tree, data, location, cb) {
  cb = cb || common.resolveInclude
  data.fmt = fmt
  return html(tree, data, location, cb)
}

