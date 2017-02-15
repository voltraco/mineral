const Chrome = require('node-chrome')
const stringify = require('json-stringify-safe')

module.exports = (source, data = {}, opts, cb) => {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  data = stringify(data)

  const chrome = Chrome(`
    const path = require('path')
    const compiler = require(path.resolve('compilers/dom'))
    const parser = require(path.resolve('parser'))

    window.onload = () => {
      const source = \`${source}\`
      const text= ${!!opts.text}
      const node = compiler(parser(source), ${data})

      if (text) {
        console.log(node.textContent)
        return window.close()
      }

      document.body.appendChild(node)
      console.log(document.body.innerHTML)
      window.close()
    }
  `)

  let out = ''
  let err = null

  chrome.on('stdout', d => (out += d))
  chrome.on('stderr', e => (err += e))
  chrome.on('exit', (code, sig) => cb(err, out))
}

