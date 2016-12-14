# SYNOPSIS
A simplified fork of the pug/jade template language.

# BUILD
[![Build Status](https://travis-ci.org/voltraco/mineral.svg)](https://travis-ci.org/voltraco/mineral)

# EXAMPLE
Here is an example `.min` file, it looks a lot like pug/jade.
```jade
html
body
  head
    link(id="css" href="../static/index.css" rel="stylesheet")
  section
    h1 Hello, World!
```

# COMMAND LINE USAGE
```
$ min example.min -o .
```

# MODULE USAGE
```js
const min = require('mineral')
const strings = ['beep', 'boop']

let template = min.dom(`
  a(href="/")
  ul
    for name in ${strings}
      li= greeting + name
`)

const t = template({ greeting: "hello, " })

someNode.appendChild(t) // append to dom or vdom
```

# FEATURES
Aside from parsing the jade syntax and generating source text,
the following control flow features and extras are currently supported...

### CONTROL-FLOW

`if`, `else if` and `else` statements

```jade
if foo
  p The variable `foo` is truthy
else if bar
  p The variable `bar` is truthy
else
  p eh, forget about it.
```

While loops

```jade
ul
  while x--
    li= x
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

### MIXINS

All html is lowercase, anything starting with an uppercase letter is a mixin.
Arguments and parens are optional.

```jade
Person(firstName, lastName)
  h1= firstName
  h2= lastName
```

Use mixins by putting a `+` before the name of the mixing. Arguments and parens
are optional.

```jade
+Person('Jello', 'Biafra')
```

### ITERATORS

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

for p in people
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

