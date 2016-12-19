const Chrome = require('node-chrome')
const fs = require('fs')
const stringify = require('json-stringify-safe')

module.exports = (source, data = {}, cb) => {
  data = stringify(data)

  const chrome = Chrome(`
    const path = require('path')
    const compiler = require(path.resolve('compilers/dom'))
    const parser = require(path.resolve('parser'))

    window.onload = () => {
      const source = \`${source}\`
      const node = compiler(parser(source), ${data})
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

