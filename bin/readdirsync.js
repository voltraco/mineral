var fs = require('fs')
var path = require('path')

module.exports = function readdirSync (p) {
  let files = []

  try {
    fs.readdirSync(p)
  } catch (ex) {
    return files
  }

  return [].concat.apply([], files.map(file => {
    let s

    try {
      s = fs.statSync(path.join(p, file))
    } catch (ex) {
      return
    }

    if (s && s.isDirectory()) {
      return readdirSync(path.join(p, file))
    }

    if (/\.min$/.test(file)) {
      return path.join(p, file)
    }
  })).filter(v => !!v)
}

