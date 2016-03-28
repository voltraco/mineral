'use strict'
var test = require('tape')
var Mineral = require('../../index')

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
  var m = Mineral(`
    // blockcomment
      span
      span
    b ${username}
  `)

  var node = m()
  var b = node.querySelector('b')
  var spans = node.querySelectorAll('span')
  assert.equal(spans.length, 0)
  assert.equal(b.textContent, 'quxx')

  assert.end()
})

test('as a template string with locals', assert => {

  var username = 'quxx'

  var m = Mineral(`
    // blockcomment
      span
      span
    h1= hello
    .foo(style="width: ${100}px")

  `)

  var node = m({ hello: 'Quxx!' })
  var h1 = node.querySelector('h1')
  var foo = node.querySelector('.foo')
  assert.equal(h1.textContent, 'Quxx!')
  assert.equal(foo.style.width, '100px')

  assert.end()
})

test('text content', assert => {

  var m = Mineral(`

    p Hello
      | world

    p.
      Jade is a terse and simple 
      templating language with a 
      strong focus on performance 
      and powerful features.`)

  var node = m()

  var longstring = 'Jade is a terse and simple templating language with a strong focus on performance and powerful features.'

  assert.equal(node.querySelector('p:first-of-type').textContent, 'Hello world')
  assert.equal(node.querySelector('p:last-of-type').textContent, longstring)

  assert.end()
})


test('hello pug', assert => {

  var m = Mineral(`

    doctype html
    html(lang="en")
      head
        title= pageTitle
        script(type='text/javascript').
          if (foo) {
             bar(1 + 5)
          }
      body
        h1 Jade - node template engine
        #container.col
          if youAreUsingJade
            p You are amazing
          else
            p You must be using mineral
          p.
            Jade is a terse and simple 
            templating language with a 
            strong focus on performance 
            and powerful features.`)

  var html = `<doctype>html</doctype><html lang="en"><head><title>pugly</title><script type="text/javascript">if (foo) {bar(1 + 5)}</script></head><body><h1>Jade - node template engine</h1><div id="container" class="col"><p>You must be using mineral</p><p>Jade is a terse and simple templating language with a strong focus on performance and powerful features.</p></div></body></html>`

  var node = m({ pageTitle: 'pugly', youAreUsingJade: false })
  assert.ok(node.childNodes.length, 2)

  var div = document.createElement('div')
  div.appendChild(node)
  assert.equal(div.innerHTML, html)
  assert.end()
})

test('entities in textContent', assert => {

  var m = Mineral(`
    p hello &ndash; thanks&sol;ok&sol;goodbye.
      `)

  var node = m()
  assert.equal(node.querySelector('p').textContent, 'hello – thanks/ok/goodbye.')

  assert.end()
})

test('entities in attributes', assert => {

  var m = Mineral(`
    h4
      span &nbsp;&ndash;&nbsp;
      `)

  var node = m()
  assert.equal(node.querySelector('span').innerHTML, '&nbsp;–&nbsp;')

  assert.end()
})

