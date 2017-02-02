var hyperdiscovery = require('hyperdiscovery')
var toilet = require('toiletdb/inmemory')
var hyperdrive = require('hyperdrive')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var memdb = require('memdb')
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
    t.plan(3)
    var db = toilet({})
    Multidat(db, function (err, multidat) {
      t.ifError(err, 'no error')
      var location = path.join('/tmp', String(Date.now()))
      mkdirp.sync(location)
      multidat.create(location, function (err, dat) {
        t.ifError(err, 'no error')
        t.equal(typeof dat, 'object', 'dat exists')
        rimraf.sync(location)
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
        t.notOk(dat.network, 'no network exposed yet')
        rimraf.sync(location)
      })
    })
  })
})

tape('multidat.list()', function (t) {
  t.test('should list all dats', function (t) {
    t.plan(3)

    var db = toilet({})
    Multidat(db, function (err, multidat) {
      t.ifError(err, 'no error')

      var location = path.join('/tmp', String(Date.now()))
      mkdirp.sync(location)
      multidat.create(location, function (err, dat) {
        t.ifError(err, 'no error')
        var dats = multidat.list()
        t.equal(dats.length, 1, 'one dat')
        rimraf.sync(location)
      })
    })
  })
})

tape('multidat.close()', function (t) {
  t.test('should be able to close a dat by its key', function (t) {
    t.plan(5)

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
          t.equal(dat.db._status, 'closed', 'db is closed')
          rimraf.sync(location)
        })
      })
    })
  })
})

tape('multidat.readManifest', function (t) {
  t.test('should read a manifest if there is one', function (t) {
    t.plan(6)
    var driveDb = memdb()
    var drive = hyperdrive(driveDb)
    var archive = drive.createArchive()
    var ws = archive.createFileWriteStream('dat.json')
    var swarm = hyperdiscovery(archive)
    ws.end(JSON.stringify({ name: 'hello-planet' }))

    var db = toilet({})
    Multidat(db, function (err, multidat) {
      t.ifError(err, 'no error')

      var location = path.join('/tmp', String(Date.now()))
      mkdirp.sync(location)
      var opts = {
        key: archive.key
      }

      multidat.create(location, opts, function (err, dat) {
        t.ifError(err, 'no error')

        dat.joinNetwork()
        multidat.readManifest(dat, function (err, manifest) {
          t.ifError(err, 'no err')
          t.equal(typeof manifest, 'object', 'right type')
          t.equal(manifest.name, 'hello-planet', 'right value')
          dat.close(function () {
            swarm.close(function () {
              t.pass('done closing')
              rimraf.sync(location)
            })
          })
        })
      })
    })
  })
})
