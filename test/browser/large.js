'use strict'
var test = require('tape')
var Mineral = require('../../index')

test('mixin with arguments', assert => {

  var m = Mineral(`

  if data.currentTrack

    mixin Play()
      .play
      .play-fill
      .pause
      .pause-fill

    mixin Track(track, sortable)
      .track(
        data-context= "queue",
        data-artist= track.artist,
        data-album= track.album,
        data-title= track.title,
        data-time= track.tags.time,
        class= track.played ? "played" : "")
        img(src= track.picture || "./empty-track.svg")

        .play-song
          .play-button(
            data-event="controls:play",
            data-artist= track.artist,
            data-album= track.album,
            data-title= track.title)
            +Play()
        .menubutton(
          data-event= "context:show",
          data-menu= "queue",
          data-artist= track.artist,
          data-album= track.album,
          data-title= track.title)

        .info
          h3.tracktitle= track.tags.title
          h5.artist= track.tags.artist.join(' ')

    .col1
      .queue-current
        .header
          svg.icon.small.queue(title="Track")
            use(xlink:href="./sprite-v2.svg#track")
          h1 Currently Playing

      .albumimage
        .overlay
        if !data.currentTrack.picture
          .cover(style="background-image: url('./record.png')")
        else
          .cover(style="background-image: url('" + data.currentTrack.picture + "')")

        .play-song
          .play-button.current-track(
            data-event="controls:play")
            +Play()

      .info
        h1.tracktitle= data.currentTrack.tags.title
        h4
          a.album(
            data-event="album:show",
            data-artist= data.currentTrack.artist,
            data-album= data.currentTrack.album)= data.currentTrack.tags.album

          span &nbsp;&ndash;&nbsp;

          a.artist(
            data-event="section:show",
            data-section="artists",
            data-artist= data.currentTrack.artist)= data.currentTrack.tags.artist[0]

    .col2
      .wrapper
        .queue-next
          .header
            svg.icon.small.queue(title="Queue")
              use(xlink:href="./sprite.svg#queue")
            h1 Up Next
            a.shuffle Shuffle
            a.clear Clear
          each track in data.tracks.next
            +Track(track, true)

        .queue-history
          .header
            svg.icon.small.queue(title="History")
              use(xlink:href="./sprite.svg#queue")
            h1 History
          each track in data.tracks.history
            +Track(track)

  else
    .empty
      h1 There is nothing in your queue.
`);

  var locals = {
    "data": {
      "currentTrack": {
        "keywords": "allah las don t you forget it allah las",
        "tags": {
          "title": "Don't You Forget It",
          "artist": [
            "Allah-Las"
          ],
          "albumartist": [
            "Allah-Las"
          ],
          "album": "Allah-Las",
          "year": "2012",
          "track": {
            "no": 2,
            "of": 12
          },
          "genre": [
            "Alternative"
          ],
          "disk": {
            "no": 1,
            "of": 1
          },
          "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
          "duration": 185,
          "time": "3:05"
        },
        "title": "don t you forget it",
        "artist": "allah las",
        "album": "allah las",
        "plays": 0,
        "syncd": false,
        "archived": false,
        "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
        "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/02 Don_t You Forget It.mp3",
        "pathToFile": "/Users/paolofragomeni/.Voltra/links/ba9a0abb-fa38-4fe7-8569-0ed35d32e0e0",
        "type": 1,
        "created": 1457884348696,
        "fixed": true,
        "played": true
      },
      "tracks": {
        "next": [
          {
            "keywords": "allah las busman s holiday allah las",
            "tags": {
              "title": "Busman's Holiday",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 3,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 208,
              "time": "3:28"
            },
            "title": "busman s holiday",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/03 Busman_s Holiday.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/91301923-c743-40df-81c9-6d254d5ea680",
            "type": 1,
            "created": 1457884348656,
            "fixed": true
          },
          {
            "keywords": "allah las sacred sands allah las",
            "tags": {
              "title": "Sacred Sands",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 4,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 211,
              "time": "3:31"
            },
            "title": "sacred sands",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/04 Sacred Sands.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/c87d7b6b-3c36-4b0e-8f2b-8388472a0a3f",
            "type": 1,
            "created": 1457884348608,
            "fixed": true
          },
          {
            "keywords": "allah las no voodoo allah las",
            "tags": {
              "title": "No Voodoo",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 5,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 181,
              "time": "3:01"
            },
            "title": "no voodoo",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/05 No Voodoo.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/15198257-4252-457b-a026-1eb474d131d6",
            "type": 1,
            "created": 1457884348578,
            "fixed": true
          },
          {
            "keywords": "allah las sandy allah las",
            "tags": {
              "title": "Sandy",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 6,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 164,
              "time": "2:44"
            },
            "title": "sandy",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/06 Sandy.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/ef74b03f-80ff-4809-af08-429c7a4f7d77",
            "type": 1,
            "created": 1457884348555,
            "fixed": true
          },
          {
            "keywords": "allah las ela navega allah las",
            "tags": {
              "title": "Ela Navega",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 7,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 235,
              "time": "3:55"
            },
            "title": "ela navega",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/07 Ela Navega.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/fb410c66-d6ad-4e1c-87db-1450b905f768",
            "type": 1,
            "created": 1457884348530,
            "fixed": true
          },
          {
            "keywords": "allah las tell me  what s on your mind  allah las",
            "tags": {
              "title": "Tell Me (What's On Your Mind)",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 8,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 212,
              "time": "3:32"
            },
            "title": "tell me  what s on your mind ",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/08 Tell Me _What_s On Your Mind_.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/bd9955fa-1ed2-4fce-9ee0-ca7817c249e2",
            "type": 1,
            "created": 1457884348509,
            "fixed": true
          },
          {
            "keywords": "allah las catalina allah las",
            "tags": {
              "title": "Catalina",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 9,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 223,
              "time": "3:43"
            },
            "title": "catalina",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/09 Catalina.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/089e7f36-ff15-4b96-800a-a8ec92ca32af",
            "type": 1,
            "created": 1457884348462,
            "fixed": true
          },
          {
            "keywords": "allah las vis a vis allah las",
            "tags": {
              "title": "Vis-A-Vis",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 10,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 209,
              "time": "3:29"
            },
            "title": "vis a vis",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/10 Vis-A-Vis.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/7d9f5523-c10f-4cfd-9cf2-fb62ccd0565e",
            "type": 1,
            "created": 1457884348433,
            "fixed": true
          },
          {
            "keywords": "allah las seven point five allah las",
            "tags": {
              "title": "Seven Point Five",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 11,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 168,
              "time": "2:48"
            },
            "title": "seven point five",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/11 Seven Point Five.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/a263689c-0d09-4d3c-a2ac-2420973fbbf9",
            "type": 1,
            "created": 1457884348414,
            "fixed": true
          },
          {
            "keywords": "allah las long journey allah las",
            "tags": {
              "title": "Long Journey",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 12,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 193,
              "time": "3:13"
            },
            "title": "long journey",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/12 Long Journey.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/894f436b-3bb0-42ad-a9f9-8e314c099c34",
            "type": 1,
            "created": 1457884348392,
            "fixed": true
          }
        ],
        "history": [
          {
            "keywords": "allah las don t you forget it allah las",
            "tags": {
              "title": "Don't You Forget It",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 2,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 185,
              "time": "3:05"
            },
            "title": "don t you forget it",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/02 Don_t You Forget It.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/ba9a0abb-fa38-4fe7-8569-0ed35d32e0e0",
            "type": 1,
            "created": 1457884348696,
            "fixed": true,
            "played": true
          },
          {
            "keywords": "allah las catamaran allah las",
            "tags": {
              "title": "Catamaran",
              "artist": [
                "Allah-Las"
              ],
              "albumartist": [
                "Allah-Las"
              ],
              "album": "Allah-Las",
              "year": "2012",
              "track": {
                "no": 1,
                "of": 12
              },
              "genre": [
                "Alternative"
              ],
              "disk": {
                "no": 1,
                "of": 1
              },
              "picture": "/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
              "duration": 213,
              "time": "3:33"
            },
            "title": "catamaran",
            "artist": "allah las",
            "album": "allah las",
            "plays": 0,
            "syncd": false,
            "archived": false,
            "picture": "/Users/paolofragomeni/.Voltra/cache/art/3514d60633065a3f00af1496f6d338b4.jpg",
            "origin": "/Users/paolofragomeni/Music/Allah-Las/Allah-Las/01 Catamaran.mp3",
            "pathToFile": "/Users/paolofragomeni/.Voltra/links/3be85533-ee09-4f9c-8fcb-2b135cdec9a2",
            "type": 1,
            "created": 1457884348748,
            "fixed": true,
            "played": true
          }
        ]
      }
    }
  }

  var div = document.createElement('div')
  div.appendChild(m(locals))
  console.log(div.innerHTML)
  assert.end()

})

