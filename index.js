var api = module.exports = {}
api.parse = require('./parser')
api.compile.html = require('./compilers/html')
api.compilers.dom = require('./compilers/dom')

