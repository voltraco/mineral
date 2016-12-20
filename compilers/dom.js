const he = require('he')
const common = require('./common')
const fmt = require('util').format
const cache = {}

const IF_RE = /^\s*if\s*/
const IN_RE = /\s*in\s*/
const LINE_COMMENT_RE = /^\/\//
const FMT_RE = /["'](.*?)["'], /
const MIN_FILE_RE = /\.min$/
const EQ_RE = /^\s*=\s*/
const QUOTE_RE = /^"|'/

const COLON = 58
const PLUS = 43
const HYPHEN = 45
const A = 65
const Z = 90

// *** experiment with creating dom nodes ***

function dom (tree, node, data) {
  let findElseBranch = false
  let logical = false

  function getValue (data, info, str) {
    if (!EQ_RE.test(str)) return str
    let exp = str.replace(EQ_RE, '')
    if (FMT_RE.test(exp)) exp = '__format(' + exp + ')'
    logical = true
    const value = common.scopedExpression(data, info, exp)
    return he.escape(value + '')
  }

  function compile(child, index) {
    if (child.dom) return node.appendChild(child.dom)

    if (child.unescaped) {
      child.content = he.escape(child.content)
    }

    const firstLetter = child.tagOrSymbol.charCodeAt(0)

    //
    // first handle any flow control statements
    //
    if (child.tagOrSymbol === 'else') {
      if (!findElseBranch) return

      logical = true
      // if this is an else-if
      if (IF_RE.test(child.content)) {
        const exp = child.content.replace(IF_RE, '')
        if (common.scopedExpression(data, child.pos, exp)) {
          findElseBranch = false
          const children = dom(child, node, data)
          if (children) node.appendChild(children)
        }
        return
      }

      findElseBranch = false
      const children = dom(child, node, data)
      if (children) node.appendChild(children)
      return
    }

    // if we are searching for an else branch, forget everything else.
    //if (findElseBranch) {
    //  if (index == tree.children.length - 1) throw new Error('missing else')
    //  return
    //}

    if (child.tagOrSymbol === 'comment') {
      const comment = document.createComment(child.content)
      node.appendChild(comment)
      return
    }

    if (child.tagOrSymbol === 'if') {
      logical = true
      if (common.scopedExpression(data, child.pos, child.content)) {
        const children = dom(child, node, data)
        console.log(node.innerHTML)
        if (children) node.appendChild(children)
        return
      }
      findElseBranch = true
      return
    }

    if (child.tagOrSymbol === 'while') {
      logical = true
      let value = ''
      while (common.scopedExpression(data, child.pos, child.content)) {
        const children = dom(child, node, data)
        if (children) node.appendChild(children)
      }
      return
    }

    if (child.tagOrSymbol === 'for') {
      logical = true

      const parts = child.content.split(IN_RE)
      if (!parts[0]) common.die(child.pos, 'TypeError', 'Unknown mixin')

      const object = common.scopedExpression(data, child.pos, parts[1])

      common.each(object, function (val, key) {
        // determine if there are identifiers for key and value
        const identifiers = parts[0].split(',')
        const keyIdentifier = identifiers[0]
        const valIdentifier = identifiers[1]
        const locals = { [keyIdentifier]: key }

        if (valIdentifier) {
          locals[valIdentifier] = val
        }
        // create a new shallow scope so that locals don't persist
        const scope = Object.assign({}, data, locals)
        const children = dom(child, node, scope)
        if (children) node.appendChild(children)
      })
      return
    }

    if (child.tagOrSymbol === 'each') {
      common.die(child.pos, 'TypeError', 'Each not supported (use for)')
    }

    // treat all piped text as plain content
    if (child.tagOrSymbol === '|') {
      return node.textContent += getValue(data, child.pos, child.content)
    }

    if (firstLetter === HYPHEN) {
      common.die(child.pos, 'Error', 'No inline code!')
    }

    if (firstLetter === COLON && cb) {
      logical = true
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
      node.textContent += parsed.body
      return
    }

    // anything prefixed with '+' is a mixin call.
    if (firstLetter === PLUS && cb) {
      logical = true
      const name = child.tagOrSymbol.slice(1)
      if (!cache[name]) {
        common.die(child.pos, 'TypeError', 'Unknown mixin')
      }

      const locals = {}
      const args = Object.keys(child.attributes).map(attr => {
        return common.scopedExpression(data, child.pos, attr)
      })

      cache[name].keys.map((k, index) => (locals[k] = args[index]))
      const scope = Object.assign({}, data, locals)
      const children = dom(cache[name].child, node, scope)
      node.appendChild(children)
      return
    }

    // defines a mixin
    if (firstLetter >= A && firstLetter <= Z) {
      logical = true
      const keys = Object.keys(child.attributes)
      cache[child.tagOrSymbol] = { child, keys }
      return
    }

    //
    // everything else is a tag
    //
    const props = common.resolveTagOrSymbol(child.tagOrSymbol)

    let el = document.createElement(props.tagname)

    if (props.id) el.id = props.id
    if (props.classname) el.className = props.classname

    if (child.attributes) {
      let attrs = Object.keys(child.attributes).map(key => {

        let value = child.attributes[key]

        // if this attribute is a boolean, make its value its key
        if (typeof value === 'boolean') {
          el.setAttribute(key, key)
        }

        if (value) {
          // all values are expressions
          value = common.scopedExpression(data, child.pos, value)

          // a class should not be empty
          if (key === 'class' && !value) return

          // data-* attributes should be escaped
          if (key.indexOf('data-') === 0) {
            value = JSON.stringify(value)
          } else {
            //value = JSON.stringify(value)
          }
        }
        el.setAttribute(key, value)
      })
    }

    if (child.content) {
      el.textContent += getValue(data, child.pos, child.content)
    }

    // nothing left to decide, recurse if there are child nodes
    if (child.children.length) {
      const children = dom(child, el, data)
      if (children) node.appendChild(children)
    }

    // if this is not a logical node, we can make an optimization
    if (!logical) child.dom = el
    node.appendChild(el)
  }

  if (tree.children && tree.children.length) {
    tree.children.map(compile)
  }
  return node
}

module.exports = function compiler (tree, data) {
  data = data || {}
  const node = document.createDocumentFragment()
  return dom(tree, node, data)
}

