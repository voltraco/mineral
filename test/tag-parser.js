'use strict'
var test = require('tape')
var Mineral = require('../index')

test('a single comment', assert => {

  var m = Mineral('//hello')
  

  assert.end()
})

test('a single tag, ends with a comment', assert => {

  var m = Mineral(`a(name="foo")
      //a(name="bar")`)

  var node = m()
  var a1 = node.querySelector('a[name="foo"]')
  var a2 = node.querySelector('a[name="bar"]')
  assert.equal(a1.name, 'foo')
  assert.ok(!a2)
  assert.end()
})

test('start with a comment, end with a tag', assert => {

  var m = Mineral(`
    // a
    span
  `)

  document.body.appendChild(m())
  var b = document.body.querySelector('span')
  var a = document.body.querySelector('a')

  assert.equal(b.textContent, '')
  assert.ok(!a)

  assert.end()
}) 

test('block comment', assert => {

  var m = Mineral(`
    // blockcomment
      span
      span
    b ok
  `)

  document.body.appendChild(m())
  var b = document.body.querySelector('b')
  assert.equal(b.textContent, 'ok')

  assert.end()
})

