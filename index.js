var api = module.exports = {}
api.parse = require('./parser')
api.compile.html = require('./compilers/html')
api.compile.dom = require('./compilers/dom')

api.html = s => {
  const tree = api.parse(s)
  return (data, loc) => api.compile.html(tree, data, loc)
}

api.dom = s => {
  const tree = api.parse(s)
  return (data, loc) => api.compile.dom(tree, data, loc)
}

