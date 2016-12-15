const QUOTED_RE = /^"|'/
const WORD_RE = /^[^\n\r =]+/
const DELIMITER_RE = /^=/
const WHITESPACE_RE = /^[^\S\x0a\x0d]*/ // but not new lines
const ANYSPACE_RE = /^\s*/ // any whitespace
const NON_WHITESPACE_RE = /^\S+/ // any non whitespace
const TAGORSYMBOL_RE = /[\.#]?[^=(\s]*/ // any valid tag or symbol
const NEWLINE_RE = /[\x0a\x0d]+/ // the next NL

//
// Lexer() provides a simple API that can read and reduce a source stream.
// each method is either a helper or a matcher that represents a token.
//
module.exports = function Lexer (str, options) {
  options = options || {}

  const lexer = {
    source: str.slice()
  }

  let lineno = 1
  let column = 1

  function updatePosition (str) {
    const lines = str.match(/\n/g)
    if (lines) lineno += lines.length
    const i = str.lastIndexOf('\n')
    column = ~i ? str.length - i : column + str.length
  }

  function matcher (re) {
    const m = re.exec(lexer.source)
    if (m === null) return
    const str = m[0]
    updatePosition(str)
    lexer.source = lexer.source.slice(m.index + str.length)
    //console.log('>', arguments.callee.caller.name, "'" + m + "'")
    return m
  }

  lexer.data = function () {
    return lexer.source
  }

  lexer.pos = function () {
    return { column: column, lineno: lineno }
  }

  lexer.length = function () {
    return lexer.source.length
  }

  lexer.exec = function (re) {
    return re.exec(lexer.source)
  }

  lexer.peek = function (index, len) {
    return lexer.source.slice(index || 0, len || 1)
  }

  lexer.pop = function (index, len) {
    const s = lexer.source.slice(index || 0, len || 1)
    lexer.source = lexer.source.slice(len || 1)
    return s
  }

  lexer.error = function error (msg) {
    const err = new SyntaxError([
      msg, ':',
      lineno, ':',
      column
    ].join(''))
    err.reason = msg
    err.line = lineno
    err.column = column
    throw err
  }

  var pm = lexer.match = {}

  pm.whitespace = function whitespace () {
    const m = matcher(WHITESPACE_RE)
    return m && m[0]
  }

  pm.anyspace = function anyspace () {
    return matcher(ANYSPACE_RE)
  }

  pm.newline = function newline () {
    return matcher(NEWLINE_RE)
  }

  pm.string = function string () {
    const quote = matcher(QUOTED_RE)
    if (!quote) return

    let value = ''
    while (lexer.source[0] !== quote[0]) {
      if (lexer.length() === 0) {
        lexer.error('missing end of string')
      }
      value += lexer.source[0]
      lexer.source = lexer.source.slice(1)
    }
    lexer.source = lexer.source.slice(1)
    updatePosition(value)
    return value
  }

  pm.nonwhitespace = function nonwhitespace () {
    return matcher(NON_WHITESPACE_RE)
  }

  pm.comment = function comment () {
    const pair = lexer.peek(0, 2)
    let value = ''

    if (pair === '//') {
      value = lexer.pop(0, 2)

      while (true) {
        const ch = lexer.peek()
        if (/[\x0a\x0d]+/.test(ch)) break
        value += lexer.pop()
      }

      updatePosition(value)
    }
    return value
  }

  pm.parens = function parens () {
    let ch = lexer.peek()
    let value = ''

    if (ch === '(') {
      var open = 1
      lexer.pop()

      while (true) {
        if (lexer.length() === 0) {
          lexer.error('missing closing paren')
        }

        ch = lexer.peek()

        if (ch === '(') {
          ++open
        } else if (ch === ')') {
          if (!--open) {
            lexer.pop()
            break
          }
        }

        value += lexer.pop(0, 1)
        updatePosition(value)
      }
    }
    return value
  }

  pm.value = function value () {
    let value = ''
    let openSingle = false
    let openDouble = false

    while (true) {
      if (lexer.length() === 0) {
        lexer.error('Unexpected end of source')
      }

      let ch = lexer.pop()

      if (ch === '\\') continue
      if (ch === '\'') openSingle = !openSingle
      if (ch === '"') openDouble = !openDouble

      if (!openSingle && !openDouble &&
        (/ |,/.test(ch) || !lexer.length())) break

      value += ch
    }

    if (value === '') lexer.error('Expected value')
    return value
  }

  pm.word = function word () {
    const m = matcher(WORD_RE)
    return m && m[0]
  }

  pm.delimiter = function delimiter () {
    const m = matcher(DELIMITER_RE)
    return m && m[0]
  }

  pm.tagOrSymbol = function tagOrSymbol () {
    const m = matcher(TAGORSYMBOL_RE)
    return m && m[0]
  }

  pm.content = function content () {
    let value = ''
    let lastch = ''

    while(true) {
      let ch = lexer.peek(0, 1)

      if (ch === '/') {
        const nextch = lexer.peek(1, 2)
        if (lastch !== ':' && nextch === '/') {
          value = value.trim() // its a line comment, not a url
          break
        }
      } else if (NEWLINE_RE.test(ch) || lexer.length() === 0) {
        break
      }
      lastch = lexer.pop()
      value += lastch
    }
    return value
  }
  return lexer
}

