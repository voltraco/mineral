var Lexer = require('./lexer')

function parseAttributes (str) {
  var lexer = Lexer(str)
  var args = {}

  while (lexer.length()) {
    lexer.match.whitespace()
    var word = lexer.match.word()
    if (!word) return args
    lexer.match.whitespace()

    var delimiter = lexer.match.delimiter()

    var value = true
    if (delimiter) {
      lexer.match.whitespace()
      value = lexer.match.value().trim()
    }

    args[word.trim()] = value
  }
  return args
}

module.exports = function Parser (source) {
  source = source.replace(/\t/g, '  ')

  var root = { tagOrSymbol: 'document', children: [] }
  var parent = root
  var lastIndent = 0
  var contentTarget = null
  var lexer = Lexer(source)

  while (lexer.length()) {
    lexer.match.newline()
    var whitespace = lexer.match.whitespace()
    lexer.match.comment()

    if (contentTarget) {
      if (whitespace.length <= lastIndent) {
        contentTarget = null
      } else {
        contentTarget.content += lexer.match.content()
        continue
      }
    }

    var tagOrSymbol = lexer.match.tagOrSymbol()

    if (tagOrSymbol) {

      var attributes = (!contentTarget &&
        parseAttributes(lexer.match.parens()))

      lexer.match.whitespace()
      lexer.match.comment()

      var indent = whitespace.length
      if (indent % 2 !== 0) lexer.error('Uneven indent')

      var tag = {
        tagOrSymbol: tagOrSymbol,
        attributes: attributes,
        content: lexer.match.content(),
        indent: indent,
        children: [],
        parent: parent
      }

      if (tagOrSymbol.slice(-1) === '.') {
        tag.tagOrSymbol = tagOrSymbol.slice(0, -1)
        contentTarget = tag
      }

      if (indent > lastIndent) {
        parent.children.push(tag)
        parent = tag
      } else if (indent < lastIndent) {
        while (parent && parent.indent >= indent) {
          parent = parent.parent
        }
        tag.parent = parent
        tag.parent.children.push(tag)
        parent = tag
      } else {
        tag.parent = parent.parent || parent
        tag.parent.children.push(tag)
      }
      lastIndent = indent
    }
  }
  return root
}

