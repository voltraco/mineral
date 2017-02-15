const test = require('tape')
const browser = require('./browser')

test('script should be unescaped', assert => {
  const source = `
    script.
      alert('x')
  `

  const opts = {
    text: true
  }

  assert.comment('script should not be escaped')

  browser(source, {}, opts, (err, html) => {
    if (err) console.log(err)
    assert.equal(html, `      alert(\'x\')`)
    assert.end()
  })
})
