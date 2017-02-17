var multidrive = require('multidrive')
var explain = require('explain-error')
var parse = require('fast-json-parse')
var concat = require('concat-stream')
var assert = require('assert')
var dat = require('dat-node')
var worker = require('dat-worker')
var pump = require('pump')
var extend = require('xtend')

module.exports = Multidat

function Multidat (db, opts, cb) {
  if (!cb) {
    cb = opts
    opts = {}
  }

  assert.equal(typeof db, 'object', 'multidat: db should be type object')
  assert.equal(typeof cb, 'function', 'multidat: cb should be type function')

  var datFactory = (opts.worker)
    ? worker
    : dat

  multidrive(db, createArchive, closeArchive, function (err, drive) {
    if (err) return cb(explain(err, 'multidat: error creating multidrive'))
    var multidat = {
      readManifest: readManifest,
      create: create,
      close: drive.close,
      list: drive.list
    }
    cb(null, multidat)

    function create (dir, opts, cb) {
      if (!cb) {
        cb = opts
        opts = {}
      }

      assert.equal(typeof dir, 'string', 'multidrive.create: dir should be a string')
      assert.equal(typeof opts, 'object', 'multidrive.create: opts should be a object')
      assert.equal(typeof cb, 'function', 'multidrive.create: cb should be a function')

      var data = {
        dir: dir,
        opts: opts
      }
      drive.create(data, cb)
    }
  })

  function createArchive (data, done) {
    var dir = data.dir
    var _opts = extend(opts, data.opts)
    datFactory(dir, _opts, done)
  }

  function closeArchive (dat, done) {
    dat.close(function (err) {
      if (err) return done(explain(err, 'multidat.closeArchive: error closing dat archive'))
      dat.db.close(done)
    })
  }
}

function readManifest (dat, done) {
  var listStream = dat.archive.list({ live: true })
  listStream.on('data', function (entry) {
    if (entry.name !== 'dat.json') return

    var rs = dat.archive.createFileReadStream('dat.json')
    var ws = concat(sink)
    pump(rs, ws, function (err) {
      if (err) return done(explain(err, 'multidat.readManifest: error piping data'))
    })
  })

  function sink (data) {
    listStream.destroy()
    var res = parse(data)
    if (res.err) return done(explain(res.err, "multidat.readManifest: couldn't parse dat.json file"))
    done(null, res.value)
  }
}
