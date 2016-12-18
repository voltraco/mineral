var requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60)
    }
})()

function ease (pos) {
  if ((pos /= 0.5) < 1) {
    return 0.5 * Math.pow(pos, 5)
  }
  return 0.5 * (Math.pow((pos - 2), 5) + 2)
}

var scrolling = false

function scrollToY (scrollTargetY, speed) {
  var scrollY = window.scrollY
  var currentTime = 0
  var pos = Math.abs(scrollY - scrollTargetY)
  var time = Math.max(0.1, Math.min(pos / speed, 0.8))

  function nextFrame () {
    currentTime += 1 / 60
    scrolling = true

    var p = currentTime / time
    var t = ease(p)

    if (p < 1) {
      requestAnimFrame(nextFrame)
      window.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t))
    } else {
      window.scrollTo(0, scrollTargetY)
      scrolling = false
    }
  }
  nextFrame()
}

var links = [].slice.call(document.querySelectorAll('li a'))
var ranges = []
var current

links.map(function (link) {
  var id = link.getAttribute('href').slice(1)
  var section = document.getElementById(id)

  ranges.push({
    upper: section.offsetTop,
    lower: section.offsetTop + section.offsetHeight,
    id: id,
    link: link
  })

  var delay

  link.addEventListener('click', function (event) {
    clickInvoked = true
    event.preventDefault()

    var prev = document.querySelector('a.active')
    if (prev) prev.className = ''
    link.className = 'active'
    scrollToY(section.offsetTop, 1500)
  })
})

var nav = document.querySelector('nav')
var hamburger = document.querySelector('.hamburger')
var showAfterClick = false
var lastpos

hamburger.addEventListener('click', function () {
  nav.style.opacity = 1
  hamburger.style.zIndex = -1
  hamburger.style.opacity = 0
  showAfterClick = true
})

function onscroll (event) {
  if (scrolling) return

  var pos = document.body.scrollTop

  if (pos <= 90 && pos >= 0 && !showAfterClick) {
    nav.style.opacity = (pos / 100)
  }

  if (pos <= 0) {
    hamburger.style.zIndex = 20
    hamburger.style.opacity = 1
  }

  if (pos < lastpos) {
    showAfterClick = false
  }

  if (pos > 100) {
    showAfterClick = false
    nav.style.opacity = .9
  }

  lastpos = pos
  pos = pos + 100

  ranges.map(function (range) {
    if (pos >= range.upper && pos <= range.lower) {
      if (range.id === current) return
      current = range.id
      var prev = document.querySelector('a.active')
      if (prev) prev.className = ''
      range.link.className = 'active'
    }
  })
}

window.addEventListener('scroll', onscroll)

