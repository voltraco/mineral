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

    each num in [1,2,3]
      h1= num

    for num in foo.bar
      h2= num

  `)

  var node = m({ foo: { bar: [1,2,3] } })
  var h1s = node.querySelectorAll('h1')
  var h2s = node.querySelectorAll('h2')

  assert.equal(h1s.length, 3)
  assert.equal(h2s.length, 3)

  assert.end()
})

