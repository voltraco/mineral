var util = require('util')

var config = { colors: true, depth: null }

module.exports = function (o) {
  console.log(util.inspect(o, config))
}
