function generate(tree, opts) {
  var eachInstalled = false
  var cache = {}
  var controlflow = ['if', 'else', 'each', 'while']
  var contentflow = ['include', 'mixin']

  function createElement(type) {
    return 'document.createElement("' + type + '")'
  }

  function createTextNode(text) {
    return 'document.createTextNode("' + text + '")'
  }

  function createFragment() {
    return 'document.createDocumentFragment()'
  }

  function valueExpression(name, v) {
    return name + '.textContent = ' + v.slice(1)
  }

  function decl(lval, rval) {
    return 'var ' + lval + ' = ' + rval
  }

  function setClassName(id, name) {
    return id + '.className = "' + name + '"'
  }

  function setAttr(name, k, v) {
    return name + '.setAttribute("' + k + '", ' + v + ')'
  }

  function append(parent, child) {
    return parent + '.appendChild(' + child + ')'
  }

  function setTextContent(name, v) {
    var val = /\s*=/.test(v) ? v.slice(1) : '"' + v + '"'
    return name + '.textContent = ' + val.replace('\n', '')
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

  function createIterator(node) {
    var ops = node.textContent.split(/\s+in\s+/)
    var code = []

    if (!eachInstalled) {
      eachInstalled = true
      code.push('', // hoisted function decl
        'function __each__(o, f) {',
          'if (Array.isArray(o)) {',
            'for (var i = 0; i < o.length; ++i) {',
              'f.call(null, i, o[i]) }}',
          'else {',
            'for (var k in o) {',
              'if (Object.prototype.hasOwnProperty(o, k)) {',
                'f.call(null, k, o[k]) }}}}', '')
    }

    code.push('__each__(' + ops[1] + ', function(' + ops[0] + ') {')
    code.push(decl(node.id, createFragment()))
    code.push(stringify(node.children[0]).join('\n'))
    code.push(append(node.parent.id, node.id))
    code.push('})', '')
    return code
  }

  function createCondition(statement, node) {
    var code = []
    var test = ''
    if (node.textContent) {
      test = ' (' + node.textContent + ')'
    }
    code.push(statement + test + ' {')
    code.push(decl(node.id, createFragment()))
    code.push(stringify(node.children[0]).join('\n'))
    code.push(append(node.parent.id, node.id))
    code.push('}', '')
    return code
  }

  function createIfCondition(node) {
    return createCondition('if', node)
  }

  function createElseCondition(node) {
    if (node.textContent.indexOf('if') === 0) {
      node.textContent = node.textContent.replace(/^if/, '').trim()
      return createCondition('else if', node)
    }
    return createCondition('else', node)
  }

  function body(s) {
    var fn = new Function('locals', [
      'locals = locals || {}',
      decl('root', createFragment()),
      'with(locals) {',
        s && s.join('\n'),
      '}',
      'return root'
    ].join('\n'))

    var run = function(locals) {
      var lstr = JSON.stringify(locals)
      if (cache[lstr]) return cache[lstr]
      cache[lstr] = fn(locals)
      return cache[lstr]
    }

    if (opts.output === 'string') {
      return [
        run.toString(),
        'var cache = {}',
        'var fn = ' + fn.toString()
      ].join('\n')
    }

    return run
  }

  function callMixin(node) {
    var params = '(' + node.signature + ')'
    var call = node.selector.slice(1) + params
    return append(node.parent.id, call)
  }

  function splitAttrs(str) {
    var attrs = str.split(',')

    return attrs.map(function(a) {
      var sep = a.indexOf('=')
      return [
        a.substr(0, sep),
        a.substr(sep + 1, a.length)]
    })
  }

  function tag(s) {
    var result = {}
    result.className = ''

    s.replace(/[\.|#]?\w+/g, function(v) {
      if (v[0] === '#') {
        if (!result.tagName) result.tagName = 'div'
        result.id = v.slice(1)
      }
      else if (v[0] === '.') {
        if (!result.tagName) result.tagName = 'div'
        result.className += v.slice(1)
      } else {
        result.tagName = v
      }
    })

    return result
  }

  function createNode(id, node) {
    var code = []

    if (!node.selector) { // no tag, attaching textnode to parent
      code.push(decl(id, createTextNode(node.textContent)))
      return code
    }

    el = tag(node.selector)
    code.push(decl(id, createElement(el.tagName)))

    if (el.id) {
      code.push(setId(id, el.id))
    }

    if (el.className) {
      code.push(setClassName(id, el.className))
    }

    if (node.signature) {
      splitAttrs(node.signature).map(function(a) {
        code.push(setAttr(id, a[0].trim(), a[1]))
      })
    }

    if (node.textContent) {
      code.push(setTextContent(id, node.textContent))
    }

    return code
  }

  var counter = 0

  function stringify(node) {
    if (!node) return

    var code = []
    var parentId = node.parent ? node.parent.id : 'root'

    if (controlflow.indexOf(node.selector) > -1) {

      if (node.selector === 'each') {
        code.push(createIterator(node))
      } else if (node.selector === 'if') {
        code.push(createIfCondition(node))
      } else if (node.selector === 'else') {
        code.push(createElseCondition(node))
      }

      return code
    } else if (node.text) {
      code.push(setSourceText(node.parent.id, node.text))
    } else if (node.selector || node.textContent) {

      if (node.selector && node.selector === 'mixin') {
        code.push(startFunction(node.textContent))
        code.push(decl(node.id, createFragment()))
        code.push(stringify(node.children[0]))
        code.push('return ' + node.id)
        code.push('}')
        return code

      } else if (node.selector && node.selector[0] === '+') {
        code.push(callMixin(node))
      } else if (node.selector && node.selector[0] === '-') {
        code.push(node.textContent)
      } else {

        code = code.concat(createNode(node.id, node))
        code.push(append(parentId, node.id))
      }
    }

    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        code = code.concat(stringify(node.children[i]))
      }
    }
    return code
  }
  return body([].concat.apply([], stringify(tree)))
}

module.exports = function(source, opts) {
  opts = opts || {}
  if (source.raw) {
    if (!opts) {
      source = source.raw.join('')
    } else {
      var patched = ''
      var args = [].slice.call(arguments)
      args.shift()
      args.forEach(function(arg, i) {
        patched += source.raw[i]
        patched += arg
      })
      patched += source.raw[source.raw.length - 1]
      source = patched
    }
  }

  function whitespace() { return match(/^\s*/) }
  function signature() { return match(/(\s*\((.*?)\)\.?)?/) }
  function textContent() { return match(/(?:\t| )?(.*?)(?:$|[\n\r])/) }
  function comment() { return match(/^\s*\/\/.*[\n\r]/) }
  function skip() { return match(/^.*[\n\r]/) }

  function selector() {
    return match(/^(?:-?[\/\-\+\.\#_a-zA-Z]+[_a-zA-Z0-9-]*)+\.?/)
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

  function isTextBlock(match) {
    var s = match && match[0]
    if (!s) return false
    return s[s.length - 1] == '.'
  }

  function indent(w) {
    var spaces = w && w[0].split('\n')
    return (spaces[spaces.length -1] || '').length
  }

  function getTag() {
    var w = whitespace()
    var s = selector()
    var sig = signature()
    var t = textContent()

    return {
      indent: indent(w),
      selector: s && s[0],
      signature: sig && sig[2],
      children: [],
      isTextBlock: isTextBlock(sig) || isTextBlock(s),
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

  function includes() {
    var re = /(?:(\s*)include (.*)($|[\n\r]))/
    var fs = require('fs')
    source = source.replace(re, function(_, ws, p) {
      var indent = ws.length
      var raw

      try { raw = fs.readFileSync(p) } catch(err) {
        if (err.name === 'TypeError') {
          err = new Error('File read not possible')
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
    includes()

    var root = {
      indent: 0,
      id: 'root',
      parent: null,
      children: []
    }

    var node
    var lastNode = root
    var index = 0

    while (source.length && (node = getTag()).selector) {

      if (node.selector.indexOf('//') > -1) {
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

  if (opts.output === 'ast') return parse(source)
  return generate(parse(source), opts)
}

