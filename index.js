var multidrive = require('multidrive')
var explain = require('explain-error')
var parse = require('fast-json-parse')
var assert = require('assert')
var dat = require('dat-node')
var extend = require('xtend')

module.exports = Multidat

function Multidat (db, opts, cb) {
  if (!cb) {
    cb = opts
    opts = {}
  }

  assert.equal(typeof db, 'object', 'multidat: db should be type object')
  assert.equal(typeof cb, 'function', 'multidat: cb should be type function')

  var datFactory = opts.dat || dat

  multidrive(db, createArchive, closeArchive, function (err, drive) {
    if (err) return cb(err)
    var multidat = {
      readManifest: readManifest,
      create: create,
      disconnect: drive.disconnect,
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
    dat.close(done)
  }
}

function readManifest (dat, cb) {
  dat.archive.readFile('dat.json', function (err, buf) {
    if (err) return cb(err)
    var res = parse(buf.toString())
    if (res.err) return cb(explain(res.err, "multidat.readManifest: couldn't parse dat.json file"))
    cb(null, res.value)
  })
}
