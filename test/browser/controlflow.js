'use strict'
var test = require('tape')
var Mineral = require('../../index')

test('if condition', assert => {

  var m = Mineral(`
    if x
      p Beep
  `)

  var node

  node = m({ x: true })
  assert.ok(node.querySelector('p'))
  node = m({ x: false })
  assert.ok(!node.querySelector('p'))
  assert.end()
})

test('if condition (padded)', assert => {

  var m = Mineral(`
    // conditional
    .c1 OK
    if x
      p Beep
    .c2 OK
  `)

  var node

  node = m({ x: true })
  assert.ok(node.querySelector('p'))
  node = m({ x: false })
  assert.ok(!node.querySelector('p'))
  assert.ok(node.querySelector('.c1'))
  assert.ok(node.querySelector('.c2'))
  assert.end()
})

test('if-else condition', assert => {

  var m = Mineral(`
    if x
      p Beep
        b
          a
    else
      p Boop
  `)

  var node

  node = m({ x: true })
  assert.ok(node.querySelector('p'))
  assert.ok(node.querySelector('p b a'))
  assert.ok(node.querySelector('p').textContent === 'Beep')
  node = m({ x: false })
  assert.ok(node.querySelector('p'))
  assert.ok(node.querySelector('p').textContent === 'Boop')

  assert.end()
})


test('if-else condition with object access', assert => {

  var m = Mineral(`
    mixin Foo()
      h1

    if x.foo
      p Beep
        b
          +Foo()
    else
      p Boop
  `)

  var node

  node = m({ x: { foo: true } })
  assert.ok(node.querySelector('p'))
  assert.ok(node.querySelector('p b h1'))
  assert.ok(node.querySelector('p').textContent === 'Beep')
  node = m({ x: { foo: false } })
  assert.ok(node.querySelector('p'))
  assert.ok(node.querySelector('p').textContent === 'Boop')

  assert.end()
})

test('if-elseif-else condition', assert => {

  var m = Mineral(`
    if x
      p Beep
    else if y
      p Quxx
    else
      p Boop
  `)

  var node

  node = m({ x: true, y: false })
  assert.ok(node.querySelectorAll('p').length, 1)
  assert.ok(node.querySelector('p').textContent === 'Beep')
  node = m({ y: true, x: false })
  assert.ok(node.querySelectorAll('p').length, 1)
  assert.ok(node.querySelector('p').textContent === 'Quxx')
  node = m({ x: false, y: false })
  assert.ok(node.querySelectorAll('p').length, 1)
  assert.ok(node.querySelector('p').textContent === 'Boop')

  assert.end()
})

test('if with multiple child nodes', assert => {

  var m = Mineral(`

    if x

      .foo
      .bazz

  `)

  var node = m({ x: true })
  var divs = node.querySelectorAll('div')
  assert.equal(divs.length, 2)

  assert.end()
})


test('each and for', assert => {

  var m = Mineral(`

    each num in [1,2,3]
      h1= num

    for num in [1,2,3]
      h2= num

  `)

  var node = m()
  var h1s = node.querySelectorAll('h1')
  var h2s = node.querySelectorAll('h2')

  assert.equal(h1s.length, 3)
  assert.equal(h2s.length, 3)

  assert.end()
})

test('each and for wrapped for locals', assert => {

  var m = Mineral(`

    each letter in ['a', 'b', 'c']
      h1= letter

    for letter in foo.bar
      h2= letter

  `)

  var node = m({ foo: { bar: ['a', 'b', 'c'] } })
  var h1s = node.querySelectorAll('h1')
  var h2s = node.querySelectorAll('h2')

  assert.equal(h2s[0].textContent, 'a')

  assert.equal(h1s.length, 3)
  assert.equal(h2s.length, 3)

  assert.end()
})

test('each with index', assert => {

  var m = Mineral(`
    .people
      mixin Foo(first, last)
        .name
          h1.first= first
          h2.last= last
        hr

    each p, index in people
      +Foo(people[index].first, people[index].last)

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

test('each without index', assert => {

  var m = Mineral(`
    .people
      mixin Foo(first, last)
        .name
          h1.first= first
          h2.last= last
        hr

    each p in people
      +Foo(p.first, p.last)

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

test('while with inline variable', assert => {

  var m = Mineral(`
    - var x = 10
    while(x--)
      h1 = x
        span

    `)

  var node = m()

  assert.equal(node.querySelectorAll('h1').length, 10)
  assert.equal(node.querySelectorAll('span').length, 10)

  assert.end()
})

test('while with local variable', assert => {


  var m = Mineral(`
    while(x--)
      h1 = x

    `)

  var node = m({ x: 10 })

  assert.equal(node.querySelectorAll('h1').length, 10)

  assert.end()
})

