# SYNOPSIS
A small fast jade engine with no dependencies.

- ✓ Works in the browser
- ✓ Works on the server (use jsdom or minidom)
- ✓ It's pretty fast...

```bash
>browserify perf/index.js | tape-run
jade x 105 ops/sec ±4.19% (49 runs sampled)
mineral x 2,677 ops/sec ±2.84% (18 runs sampled)
jade (pre-compiled) x 8,926 ops/sec ±2.58% (47 runs sampled)
mineral (pre-compiled) x 12,662 ops/sec ±6.53% (49 runs sampled)
Fastest is  [ 'mineral (pre-compiled)' ]
```

There are a ton of optimizations that can happen in this code,
the main motivation here though is Pug's size and *massive*
dependency graph. Pug and all its deps are about `102708` LOC
vs the less than `500` here.

# BUILD
[![Build Status](https://travis-ci.org/voltraco/mineral.svg)](https://travis-ci.org/voltraco/mineral)

# USAGE
Use inline for small snippets.
Mineral returns a function that returns a dom node.
The function can be stringifyed and cached of course.

```js
let min = require('mineral')
let users = ['beep', 'boop']

let template = min`a(href="/")
  ul
    each name in ${names}
      li= greeting + name
`

node.appendChild(template({ greeting: "hello, " }))
```

Keep in a separate file

```jade
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
        p Get on it!
      p.
        Jade is a terse and simple
        templating language with a
        strong focus on performance
        and powerful features.
```

# FEATURES
Aside from parsing the jade syntax and generating source text,
the following control flow features and extras are currently supported...

### CONDITIONALS
Conditional statements

```jade
if foo
  p The variable `foo` is truthy
else if bar
  p The variable `bar` is truthy
else
  p eh, forget about it.
```

### SCRIPTING

Script tags

```jade
  script.
    var s = 'hello, world'
    alert(s)
  h1 I sent you an alert.
```

Inline scriping

```jade
  .foo
    - var x = 100
    h1= x
```

Expressions

```jade
  - var a = 100;
  - var b = { number: 100 }
  h1= a + b.number
  .a(name= 'el' + a)= 'my name is el' + a
```

### MIXINS

Create mixins

```jade
.foo
mixin Person(firstName, lastName)
  h1= firstName
  h2= lastName
```

Use mixins

```jade
.person
  +Person('Jello', 'Biafra')` call mixins
```

### ITERATORS

Iterate over objects or arrays using `each` or `for`.

```jade
.people
  mixin Foo(first, last)
    .name
      h1.first= first
      h2.last= last
    hr

each p in people
  +Foo(people[p].first, people[p].last)
```

```javascript
var node = min({
  people: [
    { first: 'Tom', last: 'Waits' },
    { first: 'Dick', last: 'Dale' }
  ]
})
```

### TEXT

Multiline textblocks

```jade
.foo.
  Hello
  world.
```

Single line

```jade
.foobar
  | Hello danzig.
```

### COMMENTS

Single-line

```jade
// single line
```

Multi-line (`.beep` and `.boop` are commented)

```jade
.foo1
//
  .beep
    .boop
.foo2
```

