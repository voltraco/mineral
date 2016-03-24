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
- `if/else-if/else` statements

### ITERATORS
- `each` iterate over objects or arrays

### SCRIPTING
- `=` expressions, like `span= obj.val`
- `-` insert single lines of javascript
- `script.` insert script tags with content

### MIXINS
- `+CallMixin(...)` call mixins
- `mixin Mixin(...)` declare mixins

### TEXT BLOCKS
- `tagname.` insert text-blocks

### COMMENTS
- `//` single and multiline comments

