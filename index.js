const path = require('path')
const fs = require('fs')

const parse = require('./parser')
const html = require('./compilers/html')

const root = path.dirname(arguments[2].parent.filename)
delete require.cache[__filename]

exports.readFileSync = f => {
  const location = path.join(root, f)
  const source = fs.readFileSync(location, 'utf8')
  const tree = parse(source)
  return data => html(tree, data, root)
}
