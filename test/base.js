'use strict'
var test = require('tape')
var Mineral = require('../index')

test('an empty string', assert => {

  var m1 = Mineral(`
      
      `)
  var m2 = Mineral('')

  assert.equal(m1().childNodes.length, 0)
  assert.equal(m2().childNodes.length, 0)
  assert.end()
})

test('as a template literal', assert => {

  var username = 'quxx'
  var m = Mineral`
    // blockcomment
      span
      span
    b ${username}
  `

  var node = m()
  var b = node.querySelector('b')
  var spans = node.querySelectorAll('span')
  assert.equal(spans.length, 0)
  assert.equal(b.textContent, 'quxx')

  assert.end()
})

test('as a template string with locals', assert => {

  var username = 'quxx'

  var m = Mineral`
    // blockcomment
      span
      span
    h1= hello
    .foo(style="width: ${100}px")
  `

  var node = m({ hello: 'Quxx!' })
  var h1 = node.querySelector('h1')
  var foo = node.querySelector('.foo')
  assert.equal(h1.textContent, 'Quxx!')
  assert.equal(foo.style.width, '100px')

  assert.end()
})

