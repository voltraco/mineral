const Lexer = require('./lexer')

function parseAttributes (str) {
  const lexer = Lexer(str)
  const args = {}

  while (true) {
    lexer.match.whitespace()
    const name = lexer.match.word()
    const delimiter = lexer.match.delimiter()
    let value = true

    if (delimiter) value = lexer.match.value()
    if (!name) break

    lexer.match.whitespace()
    const separator = lexer.match.separator()
    args[name] = value
    //console.log('[%s] [%s] [%s] [%s]', name, delimiter, value, lexer.data())
    if (!lexer.length()) break
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
  let contentTargetIndent = 0

  while (lexer.length()) {
    const whitespace = lexer.match.whitespace()

    if (contentTarget) {
      if (whitespace.length <= contentTargetIndent) {
        contentTarget.content = contentTarget.content.slice(0, -1)
        contentTarget = null
      } else {
        // add newlines and whitespace, but trim to the current indent.
        const trimmed = whitespace.slice(contentTargetIndent + 2)
        contentTarget.content += trimmed + lexer.match.content(true)
        contentTarget.content += (lexer.match.newline() || '')
        continue
      }
    }

    lexer.match.comment()
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
        pos: lexer.pos()
      }

      if (tagOrSymbol.slice(-1) === '.') {
        tag.tagOrSymbol = tagOrSymbol.slice(0, -1)
        tag.unescaped = true
        contentTarget = tag
        contentTargetIndent = indent
      }

      if (indent > lastIndent) {
        tag.parent = (lastSibling || parent)
        tag.parent.children.push(tag)
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

