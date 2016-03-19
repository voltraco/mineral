'use strict'
var test = require('tape')
var Mineral = require('../index')

test('mixin with arguments', assert => {

  var m = Mineral(`
    .people
      mixin Foo(first, last)
        .name
          h1.first= first
          h2.last= last
        hr

    each p in people
      +Foo(people[p].first, people[p].last)

      `)

  var node = m({
    people: [
      { first: 'AF', last: 'AL' },
      { first: 'BF', last: 'BL' }
    ]
  })

  var firstNames = node.querySelectorAll('h1.first')
  var lastNames = node.querySelectorAll('h2.last')

  assert.equal(firstNames.length, 2)
  assert.equal(lastNames.length, 2)

  assert.end()
})

test('mixin without arguments', assert => {

  var m = Mineral(`
    mixin Foo()
      hr

    h1 hello

    each p in [1,2,3]
      +Foo()

      `)

  var node = m()

  var hrs = node.querySelectorAll('hr')

  assert.equal(hrs.length, 3)

  assert.end()
})

