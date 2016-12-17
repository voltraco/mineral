const parse = require('./parser')
const html = require('./compilers/html')
const dom = require('./compilers/dom')

module.exports = s => {
  const tree = parse(s)

  return {
    html: (data, loc) => html(tree, data, loc),
    dom: (data, loc) => dom(tree, data, loc)
  }
}

