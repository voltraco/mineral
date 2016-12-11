var util = require('util')

var config = { colors: true, depth: null }

var log = function (o) {
  console.log(util.inspect(o, config))
}

module.exports = log
