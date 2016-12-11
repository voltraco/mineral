var Lexer = require('./lexer')

function parseArgs (str) {
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
  var indent = 0
  var lexer = Lexer(source)

  while (lexer.length()) {
    lexer.match.whitespace()
    lexer.match.comment()
    lexer.match.whitespace()
    lexer.match.newline()

    var whitespace = lexer.match.whitespace()
    var tagOrSymbol = lexer.match.tagOrSymbol()

    if (tagOrSymbol) {

      var tag = {
        tagOrSymbol: tagOrSymbol,
        attributes: parseArgs(lexer.match.parens()),
        content: lexer.match.content(),
        children: [],
        parent: parent
      }

      if (whitespace.length > indent) {
        parent.children.push(tag)
        parent = tag
      } else if (whitespace.length < indent) {
        var n = (indent - whitespace.length) / 2
        while (n-- && parent) parent = parent.parent
        tag.parent = parent.parent
        tag.parent.children.push(tag)
      } else {
        parent.parent.children.push(tag)
      }

      lexer.match.whitespace()
      lexer.match.comment()
    }
    indent = whitespace.length
  }
  return root
}

