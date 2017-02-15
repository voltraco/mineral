const test = require('tape')
const fs = require('fs')
const path = require('path')
const parse = require('../parser')
const compile = require('../compilers/html')
const browser = require('./browser')

const read = s => fs.readFileSync(path.join(__dirname, 'cases', s), 'utf8')
const unique = a => a.filter((v, i, a) => i <= a.indexOf(v))

let files = fs.readdirSync(path.join(__dirname, 'cases'))

files = unique(files.map(file => file.replace(path.extname(file), '')))

const data = {}
data['attrs-data'] = { 'user': { 'name': 'tobi' } }

test('cases', assert => {
  files.map(file => {
    function onFile (assert) {
      const source = read(file + '.min')
      const actual = compile(parse(source), data[file]) + '\n'
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

