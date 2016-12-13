const util = require('util')

const config = { colors: true, depth: null }

module.exports = function (o) {
  console.log(util.inspect(o, config))
}
