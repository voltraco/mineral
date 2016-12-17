const test = require('tape')
const fs = require('fs')
const path = require('path')
const min = require('../index')

const read = s => fs.readFileSync(path.join(__dirname, 'cases', s), 'utf8')
const unique = a => a.filter((v, i, a) => i <= a.indexOf(v))

let files = fs.readdirSync(path.join(__dirname, 'cases'))

files = unique(files.map(file => file.replace(path.extname(file), '')))

const data = {}
data['attrs-data'] = { "user": { "name": "tobi" }}

test('cases', assert => {

  // assert.plan(files.length)
  files.map(file => {

    function onFile (assert) {
      const m = min(read(file + '.min'))
      const actual = m.html(data[file]) + '\n'
      const expected = read(file + '.html')
      assert.equal(actual, expected, file)
      assert.end()
    }

    test(file, onFile)
  })
  assert.end()
})

