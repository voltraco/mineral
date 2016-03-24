
var jade = require('jade')
var min = require('../../index')

var lodash = document.createElement('script')
var benchmarkjs = document.createElement('script')

lodash.src = 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.6.1/lodash.js'
benchmarkjs.src = 'https://cdnjs.cloudflare.com/ajax/libs/benchmark/2.1.0/benchmark.js'

document.body.appendChild(lodash)

lodash.onload = function(event) {
  document.body.appendChild(benchmarkjs)
}

var fixture = `

//doctype html
html(lang="en")
  head
    title= pageTitle
    script(type='text/javascript').
      if (typeof foo !== 'undefined') {
         bar(1 + 5)
      }
  body

    mixin Foo(a, b)
      h2= a + b

    +Foo(1, 2)

    each a in [1,2,3]
      b= a

    ul
      each a in { a: 1, b: 2, c: 3 }
        li= a

    - var jk = true

    span
      // a
        .foobarbazz
    
    p
      span
      +Foo(100, 200)

    h1 Jade - node template engine
    #container.col
      if youAreUsingJade
        p You are amazing
      else
        p Get on it!
      p.
        Jade is a terse and simple
        templating language with a
        strong focus on performance
        and powerful features.
`



benchmarkjs.onload = function(event) {

  var suite = new Benchmark.Suite

  var min_t = min(fixture)
  var jade_t = jade.compile(fixture)

  var div1 = document.createElement('div')
  document.body.appendChild(div1)

  var div2 = document.createElement('div')
  document.body.appendChild(div2)

  var div3 = document.createElement('div')
  document.body.appendChild(div3)

  var div4 = document.createElement('div')
  document.body.appendChild(div4)

  suite.add('jade', function() {
    var m = jade.compile(fixture)
    var html = m({ pageTitle: 'pugly', youAreUsingJade: false })
    var node = document.createElement('div')
    node.innerHTML = html
    div1.appendChild(node)
  })

  suite.add('mineral', function() {
    var m = min(fixture)
    var node = m({ pageTitle: 'pugly', youAreUsingJade: false })
    div2.appendChild(node)
  })

  suite.add('jade (pre-compiled)', function() {
    var html = jade_t({ pageTitle: Math.random(), youAreUsingJade: false })
    var node = document.createElement('div')
    node.innerHTML = html
    div3.appendChild(node)
  })

  suite.add('mineral (pre-compiled)', function() {
    var node = min_t({ pageTitle: Math.random(), youAreUsingJade: false })
    div4.appendChild(node)
  })

  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ', this.filter('fastest').map('name'))
  })

  .run()
}


