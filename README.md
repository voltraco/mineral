# SYNOPSIS
A smaller faster jade engine with zero dependencies.

# BUILD
[![Build Status](https://travis-ci.org/voltraco/mineral.svg)](https://travis-ci.org/voltraco/mineral)

# USAGE
```js
let min = require('mineral')
let strings = ['beep', 'boop']

let template = min(`a(href="/")
  ul
    each name in ${strings}
      li= greeting + name`)

let t = template({ greeting: "hello, " })

someNode.appendChild(t)
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
- var x = 10
ul
  while(x--)
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

each p, index in people
  +Foo(people[index].first, people[index].last)

each p in people
  +Foo(p.first, p.last)
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

