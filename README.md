# SYNOPSIS
A small fast jade engine with no dependencies.

- ✓ Works on the server
- ✓ Works in the browser
- ✓ It's pretty fast...

```bash
>browserify perf/index.js | tape-run
mineral x 3,361 ops/sec ±2.92% (53 runs sampled)
jade x 98 ops/sec ±6.55% (47 runs sampled)
jade (pre-compiled) x 5,390 ops/sec ±5.00% (31 runs sampled)
mineral (pre-compiled) x 6,094 ops/sec ±5.29% (47 runs sampled)
Fastest is  [ 'mineral (pre-compiled)' ]
```

I haven't started to do any optimiziation stuff yet,
The main motivation here is Pug's size and *massive*
dependency graph. Pug and all its deps are about `102708` LOC
vs the less than `400` here. LOC For now this is a good start.

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

