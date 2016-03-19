# SYNOPSIS
A small fast jade engine with no dependencies.

- ✓ Works on the server
- ✓ Works in the browser

# STATUS
Work in progress!

# USAGE
Use inline for small snippets

```js
let min = require('mineral')
let users = ['beep', 'boop']

let template = min`a(href="/")
  ul
    each user in ${users}
      li= user`

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

