# SYNOPSIS
A simplified fork of the pug/jade template language.

# MOTIVATION
Mineral is a language that compiles to markup. It's similar to Jade (aka
[pug](https://pugjs.org). Its goal is to be a light-weight alternative to pug.
A significantly smaller codebase, a slimmer set of features, some improvements
and the ability to output dom trees as well as html.

# BUILD
[![Build Status](https://travis-ci.org/voltraco/mineral.svg)](https://travis-ci.org/voltraco/mineral)

# EXAMPLE
Here is an example `.min` file, it looks a lot like jade/pug.

```jade
html
body
  head
    link(id="css" href="../static/index.css" rel="stylesheet")
  section
    h1 Hello, World!
```

# COMMAND LINE USAGE


```bash
$ min example.min -o .
```

# MODULE USAGE
Templates can be parsed, cached and compiled later with locals.

```js
const min = require('mineral')
const strings = ['glen', 'danzig']

let template = min(`
  a(href="/")
  ul
    for name in ${strings}
      li= greeting + name
`)

const t = template.dom({ greeting: "hello, " })

body.appendChild(t) // append to dom, vdom, etc.
```

# FEATURES

### MIXINS

All html is lowercase, anything starting with an uppercase letter is a mixin.
Arguments and parens are optional.

```jade
Person(firstName, lastName)
  h1= firstName
  h2= lastName
```

Use mixins by putting a `+` before the name of the mixin. Arguments and parens
are optional.

```jade
+Person('Jello', 'Biafra')
```

### LOGICAL BRANCHING

`if`, `else if` and `else` statements

```jade
if foo
  p The variable `foo` is truthy
else if bar
  p The variable `bar` is truthy
else
  p eh, forget about it.
```

### ITERATION

Iterate over objects or arrays using `for` (there is no `each` like jade/pug).
`for` will iterate over and object or array. In this example, `p` is the object
key, if the value was an array, it would be the current index.

```jade
.people
  Foo(first, last)
    .name
      h1.first= first
      h2.last= last
    hr

for key, val in people
  +Foo(val.first, val.last)

for p in people
  +Foo(people[p].first, people[p].last)
```

```javascript
{
  people: [
    { first: 'Tom', last: 'Waits' },
    { first: 'Dick', last: 'Dale' }
  ]
}
```

`while` loops

```jade
ul
  while x--
    li= x
```

### VALUE INSERTION
Using the `=` symbol indicates that the value should be an expression. An
expression can include values from the data passed to the template.

```jade
h1 = 'Hello, ' + name
```

### FORMATTING
Automatically detects `console.log`-like values.

```jade
h1 = 'Hello %s', foo
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
  h1= 'number of times: ' + 100 + 'x'
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

### FILTERS
Use any [jstramsformer](https://www.npmjs.com/browse/keyword/jstransformer)
module. For example, `npm install --save jstransformer-marked`. Arguments and
parens are optional.

```jade
:marked(gfm=true) ./readme.md
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

