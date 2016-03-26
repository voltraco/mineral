'use strict'
var test = require('tape')
var Mineral = require('../../index')

test('a single tag', assert => {

  var m = Mineral(`a`)
  var root = m()

  assert.equal(root.childNodes.length, 1)
  var a = root.querySelector('a')
  assert.ok(a)
  assert.end()
})

test('a single tag with value content', assert => {

  var m = Mineral(`a= foo`)

  var root = m({ foo: 'bar' })

  assert.equal(root.childNodes.length, 1)
  var a = root.querySelector('a')
  assert.ok(a)
  assert.equal(a.textContent, 'bar')
  assert.end()
})

test('a single tag with a single string attribute', assert => {

  var m = Mineral(`a(data-foo="quxx")`)
  var root = m()

  assert.equal(root.childNodes.length, 1)
  var a = root.querySelector('a')
  assert.ok(a)
  assert.equal(a.getAttribute('data-foo'), "quxx")
  assert.end()
})

test('class with special characters', assert => {

  var m = Mineral(`
    .foo-bar
    a.foo-bar
    a.foo_bar
    .record-mask
  `)

  var root = m()

  var a = root.querySelector('div.foo-bar')
  assert.ok(a)
  var b = root.querySelector('a.foo-bar')
  assert.ok(b)
  var c = root.querySelector('a.foo_bar')
  assert.ok(c)
  var d = root.querySelector('.record-mask')
  assert.ok(d)

  assert.end()
})

test('a single tag with a single non-string attribute', assert => {

  var m = Mineral(`
    - var x = {}
    - x.foo = 100

    a(data-foo= x.foo)
    
  `)

  var root = m()

  assert.equal(root.childNodes.length, 1)
  var a = root.querySelector('a')
  assert.ok(a)
  assert.equal(a.getAttribute('data-foo'), '100')
  assert.end()
})

test('a single tag with a single compound attribute', assert => {

  var m = Mineral(`
    - var x = {}
    - x.foo = 100

    a(data-foo= "~" + x.foo + "px")
    
  `)

  var root = m()

  assert.equal(root.childNodes.length, 1)
  var a = root.querySelector('a')
  assert.ok(a)
  assert.equal(a.getAttribute('data-foo'), '~100px')
  assert.end()
})

test('a single tag with a single non-string attribute from a local', assert => {

  var m = Mineral(`
    a(data-foo= x.foo)
    
  `)

  var root = m({ x: { foo: 100 }})

  assert.equal(root.childNodes.length, 1)
  var a = root.querySelector('a')
  assert.ok(a)
  assert.equal(a.getAttribute('data-foo'), '100')
  assert.end()
})

test('a single tag with multiple attributes', assert => {

  var m = Mineral(`
    - var x = {}
    - x.foo = 100
    a(data-foo= x.foo, name="quxx")
    
  `)

  var root = m()

  assert.equal(root.childNodes.length, 1)
  var a = root.querySelector('a')
  assert.ok(a)
  assert.equal(a.getAttribute('data-foo'), '100')
  assert.equal(a.name, 'quxx')
  assert.end()
})

test('a single tag with multiple multi-line attributes', assert => {

  var m = Mineral(`
    - var x = {}
    - x.foo = 100
    a(
      data-foo= x.foo,
      name="quxx")

  `)

  var root = m()

  assert.equal(root.childNodes.length, 1)
  var a = root.querySelector('a')
  assert.ok(a)
  assert.equal(a.getAttribute('data-foo'), '100')
  assert.equal(a.name, 'quxx')
  assert.end()
})

test('a single tag with text content', assert => {

  var m = Mineral(`
    - var x = {}
    - x.foo = 100
    a(data-foo= x.foo) Beep Boop
    
  `)

  var root = m()

  assert.equal(root.childNodes.length, 1)
  var a = root.querySelector('a')
  assert.ok(a)
  assert.equal(a.getAttribute('data-foo'), '100')
  assert.equal(a.textContent, 'Beep Boop')
  assert.end()
})

test('a single tag with multiline text content', assert => {

  var m = Mineral(`
    - var x = {}
    - x.foo = 100
    a(data-foo= x.foo).
      Beep Boop
      Quxx
      Foo
    h1 OK
  `)

  var root = m()

  assert.equal(root.childNodes.length, 2)
  var a = root.querySelector('a')
  var h1 = root.querySelector('h1')

  assert.ok(a)
  assert.ok(h1)
  assert.equal(a.getAttribute('data-foo'), '100')
  assert.equal(a.textContent, 'Beep BoopQuxxFoo')
  assert.equal(h1.textContent, 'OK')
  assert.end()
})

test('child tags', assert => {

  var m = Mineral(`
    - var x = {}
    - x.foo = 100
    a(data-foo= x.foo) Beep Boop
      b.fuzz quxx
  `)

  var root = m()

  var b = root.querySelector('a .fuzz')

  assert.ok(b)
  assert.equal(b.textContent, 'quxx')
  assert.end()
})

test('child tags', assert => {

  var m = Mineral(`
    - var x = {}
    - x.foo = 100
    a(data-foo= x.foo) Beep Boop
      span
        b
          span beep
      .foo
        .bar
          .bazz boop
  `)

  var root = m()

  var span = root.querySelector('a span b span')
  var div = root.querySelector('a .foo .bar .bazz')

  assert.ok(span)
  assert.ok(div)
  assert.equal(span.textContent, 'beep')
  assert.equal(div.textContent, 'boop')
  assert.end()
})

