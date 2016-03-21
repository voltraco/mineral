'use strict'
var fs = require('fs')
var path = require('path')
var test = require('tape')
var min = require('../../index')

test('include', assert => {

  var m = min(`

    doctype html
    html(lang="en")
      body
        h1 Jade - node template engine
        include test/fixtures/template.jade

  `, { output: 'string' })

  var dest = '/../browser/generated/include.js'
  dest = path.join(__dirname, dest)
  fs.writeFileSync(dest, 'module.exports = ' + m)

  var stat = fs.statSync(dest)
  assert.ok(stat)

  assert.end()
})

