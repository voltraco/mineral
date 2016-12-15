const api = {}
api.parse = require('./parser')
api.compile.html = require('./compilers/html')
api.compile.dom = require('./compilers/dom')

module.exports = s => {
  const tree = api.parse(s)

  return {
    html: (data, loc) => api.compile.html(tree, data, loc),
    dom: (data, loc) => api.compile.dom(tree, data, loc)
  }
}

