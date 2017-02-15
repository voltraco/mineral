const test = require('tape')
const fs = require('fs')
const path = require('path')
const min = require('../index')

const base = path.join(__dirname, 'fixtures', 'mixins')

test('mixin not found', assert => {
  const m = min.readFileSync('./fixtures/mixins/withoutmixin.min')
  try {
    m({}, base)
  } catch (ex) {
    const r = /Unknown mixin \(Foo\) in (.*):7:2/
    assert.ok(r.test(ex.message))
    assert.end()
  }
})

test('mixin found', assert => {
  const m = min.readFileSync('./fixtures/mixins/withmixin.min')
  const actual = m({}, base)
  assert.equal(actual, '<div class="bazz"><h1>Foobar</h1></div>')
  assert.end()
})

