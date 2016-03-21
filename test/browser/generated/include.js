module.exports = function (locals) {
      var lstr = JSON.stringify(locals)
      if (cache[lstr]) return cache[lstr]
      cache[lstr] = fn(locals)
      return cache[lstr]
    }
var cache = {}
var fn = function anonymous(locals
/**/) {
locals = locals || {}
var root = document.createDocumentFragment()
with(locals) {
var v1 = document.createElement("doctype")
v1.textContent = "html"
root.appendChild(v1)
var v2 = document.createElement("html")
v2.setAttribute("lang", "en")
root.appendChild(v2)
var v3 = document.createElement("body")
v2.appendChild(v3)
var v4 = document.createElement("h1")
v4.textContent = "Jade - node template engine"
v3.appendChild(v4)
var v5 = document.createElement("h1")
v5.textContent = "Foo"
v4.appendChild(v5)
var v6 = document.createElement("b")
v6.textContent = "bar"
v5.appendChild(v6)
}
return root
}