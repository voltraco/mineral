const test = require('tape')
const fs = require('fs')
const path = require('path')
const parse = require('../parser')
const compile = require('../compilers/html')

const base = path.join(__dirname, 'fixtures')
const read = s => fs.readFileSync(path.join(base, s), 'utf8')

test('a tree can be cached', assert => {
  const m = parse(read('./cached.min'))

  const template = d => compile(m, d)

  assert.equal(template({ foo: 100 }), '<div class="bar"><h1>100</h1></div>')
  assert.equal(template({ foo: 200 }), '<div class="bar"><h1>200</h1></div>')
  assert.end()
})
