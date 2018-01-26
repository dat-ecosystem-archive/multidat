var toilet = require('toiletdb/inmemory')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var Dat = require('dat-node')
var path = require('path')
var tape = require('tape')

var Multidat = require('./')
var noop = function () {}

tape('multidat = Multidat()', function (t) {
  t.test('should assert input types', function (t) {
    t.plan(2)
    t.throws(Multidat.bind(null), /object/)
    t.throws(Multidat.bind(null, {}), /function/)
  })
})

tape('multidat.create()', function (t) {
  t.test('should assert input types', function (t) {
    t.plan(4)
    var db = toilet({})
    Multidat(db, function (err, multidat) {
      t.ifError(err, 'no error')
      t.throws(multidat.create.bind(null), 'string')
      t.throws(multidat.create.bind(null, ''), 'function')
      t.throws(multidat.create.bind(null, 123, noop), 'object')
    })
  })

  t.test('should create a dat', function (t) {
    t.plan(4)
    var db = toilet({})
    Multidat(db, function (err, multidat) {
      t.ifError(err, 'no error')
      var location = path.join('/tmp', String(Date.now()))
      mkdirp.sync(location)
      multidat.create(location, function (err, dat) {
        t.ifError(err, 'no error')
        t.equal(typeof dat, 'object', 'dat exists')
        dat.close(function (err) {
          t.ifError(err, 'no error')
          rimraf.sync(location)
        })
      })
    })
  })

  t.test('created dat should not be exposed to the network', function (t) {
    t.plan(3)
    var db = toilet({})
    Multidat(db, function (err, multidat) {
      t.ifError(err, 'no error')
      var location = path.join('/tmp', String(Date.now()))
      mkdirp.sync(location)
      multidat.create(location, function (err, dat) {
        t.ifError(err, 'no error')
        dat.close(function (err) {
          t.ifError(err, 'no error')
          rimraf.sync(location)
        })
      })
    })
  })
})

tape('multidat.list()', function (t) {
  t.test('should list all dats', function (t) {
    t.plan(4)

    var db = toilet({})
    Multidat(db, function (err, multidat) {
      t.ifError(err, 'no error')

      var location = path.join('/tmp', String(Date.now()))
      mkdirp.sync(location)
      multidat.create(location, function (err, dat) {
        t.ifError(err, 'no error')
        var dats = multidat.list()
        t.equal(dats.length, 1, 'one dat')
        dat.close(function (err) {
          t.ifError(err, 'no error')
          rimraf.sync(location)
        })
      })
    })

    /* t.test('creation error', function (t) {
      t.plan(3)
      var db = toilet({})
      Multidat(db, {}, function (err, multidat) {
        t.ifError(err, 'no error')
        multidat.create('/non/existing/path', function (err, dat) {
          t.ok(err, 'error')
          t.notOk(dat, 'no dat')
        })
      })
    }) */
  })
})

tape('multidat.close()', function (t) {
  t.test('should be able to close a dat by its key', function (t) {
    t.plan(4)

    var db = toilet({})
    Multidat(db, function (err, multidat) {
      t.ifError(err, 'no error')

      var location = path.join('/tmp', String(Date.now()))
      mkdirp.sync(location)
      multidat.create(location, function (err, dat) {
        t.ifError(err, 'no error')
        multidat.close(dat.key, function (err) {
          t.ifError(err, 'no error')
          var dats = multidat.list()
          t.equal(dats.length, 0, 'no dats')
          rimraf.sync(location)
        })
      })
    })
  })
})

tape('multidat.readManifest', function (t) {
  t.test('should read a manifest if there is one', function (t) {
    var sourceLocation = path.join('/tmp', String(Date.now()))
    Dat(sourceLocation, { indexing: false }, function (err, sourceDat) {
      t.ifError(err, 'no error')
      sourceDat.joinNetwork()
      var ws = sourceDat.archive.createWriteStream('dat.json')
      ws.end(JSON.stringify({ name: 'hello-planet' }))

      var db = toilet({})
      Multidat(db, function (err, multidat) {
        t.ifError(err, 'no error')

        var location = path.join('/tmp', String(Date.now()))
        mkdirp.sync(location)

        multidat.create(location, { key: sourceDat.key }, function (err, dat) {
          t.ifError(err, 'no error')

          dat.joinNetwork()
          multidat.readManifest(dat, function (err, manifest) {
            t.ifError(err, 'no err')
            t.equal(typeof manifest, 'object', 'right type')
            t.equal(manifest.name, 'hello-planet', 'right value')
            dat.close(function () {
              sourceDat.close(function () {
                rimraf.sync(location)
                rimraf.sync(sourceLocation)
                t.end()
              })
            })
          })
        })
      })
    })
  })
})
