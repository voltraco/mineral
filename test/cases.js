const test = require('tape')
const fs = require('fs')
const path = require('path')
const min = require('../index')
const Chrome = require('node-chrome')
const stringify = require('json-stringify-safe')

const browser = (source, data = {}, cb) => {
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

const read = s => fs.readFileSync(path.join(__dirname, 'cases', s), 'utf8')
const unique = a => a.filter((v, i, a) => i <= a.indexOf(v))

let files = fs.readdirSync(path.join(__dirname, 'cases'))

files = unique(files.map(file => file.replace(path.extname(file), '')))

const data = {}
data['attrs-data'] = { 'user': { 'name': 'tobi' } }

test('cases', assert => {
  // assert.plan(files.length)
  files.map(file => {
    function onFile (assert) {
      const source = read(file + '.min')
      const m = min(source)
      const actual = m.html(data[file]) + '\n'
      const expected = read(file + '.html')
      assert.equal(actual, expected, 'node output matches')

      browser(source, data[file], (code, html) => {
        assert.equal(html + '\n', expected, 'browser output matches')
        assert.end()
      })
    }

    test(file, onFile)
  })
  assert.end()
})

