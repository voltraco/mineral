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

