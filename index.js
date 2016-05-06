var NL = '\n'
var controlflow = ['if', 'else', 'each', 'for', 'while']
var contentflow = ['include', 'mixin']

var PRIMITIVE_RE = /^(["'])((\\["'])?[^"'])+?\1$|^\d+$|^(true|false)$/
var SPLIT_RE = /,\s*/
var TAG_RE = /((?:\.|#)?(?:[^\.\#]+))/g

function createElement(type, ns) {
  if (ns) return 'Element("' + type + '", "' + ns + '")'
  return 'Element("' + type + '")'
}

function createTextNode(text) {
  return 'doc.createTextNode(' + text + ')'
}

function createFragment() {
  return 'Element()'
}

function decl(lval, rval) {
  return 'var ' + lval + ' = ' + rval
}

function setClassName(id, name) {
  return id + '.className = "' + name + '"'
}

function append(parent, child) {
  return parent + '.appendChild(' + child + ')'
}

function wrapWithLocals(s) {
  return 'with(locals) {' + s + '}'
}

function wrapImmediate(s) {
  return 'function() { ' + wrapWithLocals('return ' + s) + ' }()'
}

function wrapNonPrimitives(test, towrap) {
  if (!PRIMITIVE_RE.test(test)) {
    return wrapWithLocals(towrap)
  }
  return towrap
}

function setAttr(name, k, v, withoutLocals) {
  v = typeof v === 'string' ? v.trim() : 'true'
  var s = ''

  if (k === 'class') {
    s = name + '.className += " " + (' + v + ')'
  } else {
    s = name + '.setAttribute("' + k + '", ' + v + ')'
  }
  if (withoutLocals) return s
  return wrapNonPrimitives(v, s)
}

function setTextContent(name, v, withoutLocals) {
  v = v.replace(NL, '').replace(/\\([\s\S])|(")/g, '\\$1$2')

  if (/^\s*!?=/.test(v)) {
    v = v.slice(1)
    if (withoutLocals) return name + '.textContent = ' + v
    return name + '.textContent = ' + wrapImmediate(v)
  }
  return name + '.textContent = Entitify("' + v + '")'
}

function setSourceText(name, v) {
  return name + '.text += "' + v + '"'
}

function setId(node, name) {
  return node + '.id = "' + name + '"'
}

function startFunction(sig) {
  return 'function ' + sig + ' {'
}

function callMixin(node, withoutLocals) {
  var sig = '(' + node.signature + ')'
  sig = node.selector.slice(1) + sig

  var call = withoutLocals ? sig : wrapImmediate(sig)
  return append(node.parent.id, call)
}

function splitAttrs(str) {
  var attrs = {}
  var lines = str.split(SPLIT_RE)
  lines.map(function(source) {
    var pair = source.split(/=(.+)?/)
    return attrs[pair[0].trim()] = pair[1] || true
  })
  return attrs
}

function tag(s) {
  var result = {}
  result.className = ''

  s.replace(TAG_RE, function(v) {
    if (v[0] === '#') {
      if (!result.tagName) result.tagName = 'div'
      result.id = v.slice(1)
    }
    else if (v[0] === '.') {
      if (!result.tagName) result.tagName = 'div'
      result.className += v.slice(1) + ' '
    } else {
      result.tagName = v
    }
  })
  return result
}

function Entitify(s) {
  var container = document.createElement('div')
  if (s.indexOf('&') === -1) return s
  return s.replace(/&\w+;/g, function(e) {
    container.innerHTML = e
    return container.textContent
  })
}

function Element(name, ns) {
  if (!name) {
    name = 'document'
    cache['document'] = createDocument()
  } else if (!cache[name]) {
    if (ns) cache[name] = createElementNS(ns, name)
    else cache[name] = createElement(name)
  }
  return cache[name].cloneNode(false)
}

function Each(o, f) {
  var has = Object.prototype.hasOwnProperty
  if (Array.isArray(o)) {
    for (var i = 0; i < o.length; ++i) {
      f.call(null, o[i], i) }
  } else {
    for (var k in o) {
      if (has.call(o, k)) {
        f.call(null, o[k], k)
      }
    }
  }
}

function createWhileLoop(node, withoutLocals) {
  var test = node.signature || node.textContent
  if (test) {
    test = '(' + (withoutLocals ? test : wrapImmediate(test)) + ')'
  }
  var code = ''
  code += 'while ' + test + ' {' + NL
  code += decl(node.id, createFragment()) + NL

  if (node.children) {
    for (var im = 0; im < node.children.length; im++) {
      code += stringify(node.children[im], withoutLocals)
    }
  }

  code += append(node.parent.id, node.id) + NL
  code += '}'
  return code
}

function createIterator(node, withoutLocals) {
  var ops = node.textContent.split(/\s+in\s+/)

  var code = ''
  code += 'Each(' + ops[1] + ', function(' + ops[0] + ') {' + NL
  code += decl(node.id, createFragment()) + NL

  if (node.children) {
    for (var im = 0; im < node.children.length; im++) {
      code += stringify(node.children[im], withoutLocals)
    }
  }

  code += append(node.parent.id, node.id) + NL
  code += '})'

  return wrapWithLocals(code)
}

function createMixin(node) {
  var code = ''
  code += startFunction(node.textContent) + NL
  code += decl(node.id, createFragment()) + NL

  if (node.children) {
    for (var im = 0; im < node.children.length; im++) {
      code += stringify(node.children[im], true)
    }
  }
  code += 'return ' + node.id + NL + '}' + NL
  return code
}

function createCondition(statement, node, withoutLocals) {
  var test = node.signature || node.textContent
  if (test) {
    test = '(' + (withoutLocals ? test : wrapImmediate(test)) + ')'
  }
  var code = ''
  code += statement + test + ' {' + NL
  code += decl(node.id, createFragment()) + NL

  if (node.children) {
    for (var im = 0; im < node.children.length; im++) {
      code += stringify(node.children[im], withoutLocals)
    }
  }

  code += append(node.parent.id, node.id) + NL
  code += '}' + NL
  return code
}

function createIfCondition(node, withoutLocals) {
  return createCondition('if', node, withoutLocals)
}

function createElseCondition(node, withoutLocals) {
  if (node.textContent.indexOf('if') === 0) {
    node.textContent = node.textContent.replace(/^if/, '').trim()
    return createCondition('else if', node, withoutLocals)
  }
  return createCondition('else', node, withoutLocals)
}

function createNodeNS(id, el) {
  var code = ''
  code += decl(id, createElement(el.tagName, 'http://www.w3.org/2000/svg')) + NL
  code += id + '.setAttributeNS(' +
  '"http://www.w3.org/2000/xmlns/", ' +
  '"xmlns:xlink", ' + // so ugly wat
  '"http://www.w3.org/1999/xlink")' + NL
  if (el.className && el.className.length) {
    code += id + '.setAttribute("class", "' + el.className.trim() + '")' + NL
    el.className = ''
  }
  return code
}

function createNode(id, node, withoutLocals) {
  var code = ''

  if (!node.selector) { // no tag, attaching textnode to parent
    if (node.textContent[0] == '|') {
      node.textContent = node.textContent.replace(/^\|/, '')
    } else if (node.textContent[0] == '!') {
      var text = node.textContent.replace(/^!= /, '') + NL
      code += decl('content_' + id, wrapImmediate(text)) + NL
      code += decl(id, createTextNode('content_' + id)) + NL
      return code
    }

    node.textContent = 'Entitify("' + node.textContent + '")'
    code += decl(id, createTextNode(node.textContent)) + NL
    return code
  }

  var attrs = {}

  if (node.signature) attrs = splitAttrs(node.signature)

  var el = tag(node.selector)

  if (el.tagName === 'svg') {
    code += createNodeNS(id, el)
  } else if (el.tagName === 'use') {
    code += createNodeNS(id, el)
  } else {
    code += decl(id, createElement(el.tagName)) + NL
  }

  if (el.id) {
    code += setId(id, el.id) + NL
  }

  if (el.className) {
    code += setClassName(id, el.className.trim()) + NL
  }

  for(var a in attrs) {
    if (a === 'xlink:href') {
      code += id + '.setAttributeNS('
      code += '"http://www.w3.org/1999/xlink", '
      code += '"href", ' + attrs[a] + ')' + NL
      continue
    }
    code += setAttr(id, a, attrs[a], withoutLocals) + NL
  }

  if (node.textContent) {
    code += setTextContent(id, node.textContent, withoutLocals) + NL
  }

  return code
}

function stringify(node, withoutLocals) {
  var code = ''
  var parentId = node.parent.id

  if (!node) return code

  if (controlflow.indexOf(node.selector) > -1) {

    if (node.selector === 'while') {
      code += createWhileLoop(node, withoutLocals) + NL
    } else if (node.selector === 'each' || node.selector === 'for') {
      code += createIterator(node, withoutLocals) + NL
    } else if (node.selector === 'if') {
      code += createIfCondition(node, withoutLocals) + NL
    } else if (node.selector === 'else') {
      code += createElseCondition(node, withoutLocals) + NL
    }

    return code
  } else if (node.text) {
    code += setSourceText(node.parent.id, node.text) + NL
  } else if (node.selector || node.textContent) {

    if (node.selector && node.selector === 'mixin') {
      node.withoutLocals = true
      return code += createMixin(node)
    } else if (node.selector && node.selector[0] === '+') {
      code += callMixin(node, withoutLocals) + NL
    } else if (node.selector && node.selector[0] === '-') {
      code += (withoutLocals
        ? node.textContent
        : wrapWithLocals(node.textContent)) + NL

    } else {

      code += createNode(node.id, node, withoutLocals) + NL
      code += append(parentId, node.id) + NL
    }
  }

  if (node.children) {
    for (var i = 0; i < node.children.length; i++) {
      code += stringify(node.children[i], withoutLocals)
    }
  }
  return code
}

function generate(tree, opts) {
  var cache = {}
  var content = stringify(tree)

  var body = [
    'var doc = document',
    'var createDocument = doc.createDocumentFragment.bind(doc)',
    'var createElement = doc.createElement.bind(doc)',
    'var createElementNS = doc.createElementNS.bind(doc)',
    Element.toString(),
    decl('root', createFragment()),
    content,
    'return root'
  ].join(NL)

  var fn = new Function('locals', 'Each', 'Entitify', 'cache', body)

  return function(locals) {
    locals = locals || {}
    return fn(locals, Each, Entitify, cache)
  }

  if (opts.output === 'string') {
    return [
      'var cache = {}',
      'var fn = ' + fn.toString()
    ].join(NL)
  }
}

module.exports = function(source, opts) {
  opts = opts || {}

  function signature() {
    if (!/^\(/.test(source)) return ''

    var ch
    var i = 0
    var open = 0
    var value = ''
    while (ch = source[i++]) {
      if(ch == '(') ++open
      if(ch == ')') {
        --open
        if (open === 0) {
          value = source.substr(1, i-2)
          source = source.slice(i)
          break
        }
      }
    }
    return value
  }

  function whitespace() { return match(/^\s*/) }
  function textContent() { return match(/(?:\|\t| )?(.*?)(?:$|[\n\r])/) }
  function comment() { return match(/^\s*\/\/.*[\n\r]/) }
  function skip() { return match(/^.*[\n\r]/) }

  function selector() { // TODO move `//`, `-` and `+` to `special()`
    return match(/^(?:-?[\/\-\+\.\#_a-zA-Z-]+[_a-zA-Z0-9-]*)+\.?/)
  }

  function peek() {
    var next = /^(\s*).*($|[\n\r])/.exec(source)
    if (next && next[1]) return next[1].length
    return 0
  }

  function match(re) {
    var m = re.exec(source)
    if (!m) return
    var str = m[0]
    source = source.slice(str.length)
    return m
  }

  function indent(w) {
    var spaces = w && w[0].split('\n')
    return (spaces[spaces.length -1] || '').length
  }

  function getTag() {
    var w = whitespace()
    var s = selector()
    var sig = signature()
    var text = match(/^\./) || /\.$/.test(s)
    var t = textContent()

    return {
      indent: indent(w),
      selector: s && s[0],
      signature: sig,
      children: [],
      isTextBlock: text,
      textContent: t && t[1]
    }
  }

  function getTextNodes(source, node) {
    var index = 0

    while (peek() > node.indent) {
      whitespace()

      var textNode = {}
      var t = textContent()

      if (node.selector === 'script') {
        textNode.text = t && t[1]
      } else {
        textNode.textContent = t && t[1]
      }

      textNode.parent = node
      textNode.id = 'v' + (++index) + node.id
      node.children.push(textNode)
    }
  }

  function includes(opts) {
    if (typeof module === 'undefined') return

    var re = /(?:(\s*)include (.*)($|[\n\r]))/
    var fs = require('fs')
    var path = require('path')

    source = source.replace(re, function(_, ws, p) {
      var indent = ws.length
      var raw

      if (!process) {
        console.error('Process not available')
      }

      if (!opts.dir) { opts.dir = process.cwd() }
      try { raw = fs.readFileSync(path.join(opts.dir, p)) }
      catch(err) {
        if (err.name === 'TypeError') {
          err = 'File read not possible'
        }
        console.error(err)
      }

      if (!raw) return ''
      return raw.toString().split('\n').map(function(line) {
        return '\n' + Array(indent + 1).join(' ') + line
      }).join('\n')
    })
  }

  function parse() {
    includes(opts)

    var root = {
      indent: 0,
      id: 'root',
      children: []
    }

    root.parent = root

    var node
    var lastNode = root
    var index = 0

    while (source.length && (node = getTag())) {

      if (node.selector && node.selector.indexOf('//') > -1) {
        while (peek() > node.indent) skip()
        continue
      }

      node.id = 'v' + (++index)

      if (node.isTextBlock) getTextNodes(source, node)
      if (lastNode && (node.indent > lastNode.indent) ) {
        node.parent = lastNode
        lastNode.children.push(node)
      } else if (lastNode && node.indent === lastNode.indent) {
        node.parent = lastNode.parent
        ;(lastNode.parent || root).children.push(node)
      } else if (lastNode) {
        var peer = lastNode
        while (peer && node.indent < peer.indent) {
          peer = peer.parent
        }

        if (peer) {
          node.parent = peer.parent || root
          node.parent.children.push(node)
        }
      }
      lastNode = node
    }
    return root
  }

  if (opts.output === 'ast') return parse(source, false)
  return generate(parse(source, false), opts)
}
