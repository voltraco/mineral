
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
      if (foo) {
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
  console.log(min_t({ pageTitle: Math.random(), youAreUsingJade: false }))
  console.log(jade_t({ pageTitle: Math.random(), youAreUsingJade: false }))

  var _a = document.createElement('div')
  var _b = document.createElement('div')
  document.body.appendChild(_a)
  document.body.appendChild(_b)

  suite.add('mineral', function() {
    var m = min(fixture)
    var node = m({ pageTitle: 'pugly', youAreUsingJade: false }) 
  })

  suite.add('jade', function() {
    var m = jade.compile(fixture)
    var node = m({ pageTitle: 'pugly', youAreUsingJade: false }) 
  })

  suite.add('jade (pre-compiled)', function() {
    var node = jade_t({ pageTitle: Math.random(), youAreUsingJade: false }) 
    _a.innerHTML = node
  })

  suite.add('mineral (pre-compiled)', function() {
    var node = min_t({ pageTitle: Math.random(), youAreUsingJade: false }) 
    _a = node
  })

  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ', this.filter('fastest').map('name'))
  })

  .run()
}


