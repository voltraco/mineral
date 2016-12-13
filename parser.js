const Lexer = require('./lexer')

function parseAttributes (str) {
  const lexer = Lexer(str)
  const args = {}

  while (lexer.length()) {
    lexer.match.whitespace()
    const word = lexer.match.word()
    if (!word) return args
    lexer.match.whitespace()

    const delimiter = lexer.match.delimiter()

    let value = true
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

  const lexer = Lexer(source)
  const root = { tagOrSymbol: 'document', children: [] }

  let parent = root
  let lastIndent = 0
  let lastSibling = null
  let contentTarget = null

  while (lexer.length()) {
    const whitespace = lexer.match.whitespace()
    lexer.match.comment()

    if (contentTarget) {
      if (whitespace.length <= lastIndent) {
        contentTarget = null
      } else {
        contentTarget.content += lexer.match.content()
        continue
      }
    }

    const tagOrSymbol = lexer.match.tagOrSymbol()

    if (tagOrSymbol) {

      const attributes = (!contentTarget &&
        parseAttributes(lexer.match.parens()))

      lexer.match.whitespace()
      lexer.match.comment()

      const indent = whitespace.length
      if (indent % 2 !== 0) lexer.error('Uneven indent')

      const tag = {
        tagOrSymbol: tagOrSymbol,
        attributes: attributes,
        content: lexer.match.content(),
        indent: indent,
        children: [],
        parent: parent,
        pos: lexer.pos()
      }

      if (tagOrSymbol.slice(-1) === '.') {
        tag.tagOrSymbol = tagOrSymbol.slice(0, -1)
        contentTarget = tag
      }

      if (indent > lastIndent) {
        (lastSibling || parent).children.push(tag)
        lastSibling = null
        parent = tag
      } else if (indent < lastIndent) {
        while (parent && parent.indent >= indent) {
          parent = parent.parent
        }
        tag.parent = parent
        tag.parent.children.push(tag)
        lastSibling = null
        parent = tag
      } else {
        tag.parent = parent.parent || parent
        tag.parent.children.push(tag)
        lastSibling = tag
      }
      lastIndent = indent
    }
    lexer.match.newline()
  }
  return root
}

