const test = require('tape')
const fs = require('fs')
const path = require('path')
const min = require('../index')

const base = path.join(__dirname, 'fixtures', 'mixins')
const read = s => fs.readFileSync(path.join(base, s), 'utf8')

test('mixin not found', assert => {
  const m = min(read('./withoutmixin.min'))
  try {
    m.html({}, base)
  } catch (ex) {
    const r = /Unknown mixin \(Foo\) in (.*)\/test\/fixtures\/mixins:7:2/
    assert.ok(r.test(ex.message))
    assert.end()
  }
})

test('mixin found', assert => {
  const m = min(read('./withmixin.min'))
  const actual = m.html({}, base)
  assert.equal(actual, '<div class="bazz"><h1>Foobar</h1></div>')
  assert.end()
})

