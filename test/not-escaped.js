const test = require('tape')
const parse = require('../parser')
const compile = require('../compilers/html')

test('allow text to be unescaped', assert => {
  const m = parse(`
    span
      | "test check" &amp; 'quot;
      ! "test check" &amp; 'quot;
      | "test check" &amp; 'quot;
      ! "test check" &amp; 'quot;
  `)

  assert.equal(
    compile(m),
    `<span> &quot;test check&quot; &amp;amp; &#x27;quot; "test check" &amp; 'quot; &quot;test check&quot; &amp;amp; &#x27;quot; "test check" &amp; 'quot;</span>`
  )
  assert.end()
})
