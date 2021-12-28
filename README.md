[![deprecated](http://badges.github.io/stability-badges/dist/deprecated.svg)](https://dat-ecosystem.org/) 

More info on active projects and modules at [dat-ecosystem.org](https://dat-ecosystem.org/) <img src="https://i.imgur.com/qZWlO1y.jpg" width="30" height="30" /> 

---

# multidat
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Manage multiple [dat][dat] instances in multiple locations.

## Usage
```js
var Multidat = require('multidat')
var toilet = require('toiletdb')

var db = toilet('/tmp/dat')
Multidat(db, function (err, multidat) {
  if (err) throw err

  multidat.create(opts, function (err, dat) {
    if (err) throw err

    var dats = multidat.list()
    console.log(dats)

    multidat.close(dat.archive.key, function (err) {
      if (err) throw err
      console.log()
    })
  })
})
```

## Error handling
If there is an error initializing a dat, instead of the whole process failing, an error object with attached `.dir` property will be pushed into the list of dats instead. That means when consuming `multidat.list()`, you should check for errors:

```js
var dats = multidat.list()
dats.forEach(function (dat) {
  if (dat instanceof Error) {
    var err = dat
    console.log('failed to initialize dat in %s: %s', err.dir, err.message)
  }
})
```

This way you can decide for yourself whether an individual initialization failure should cause the whole process to fail or not.

## API
### Multidat(db, opts, callback(err, multidat))
Creat a new Multidat instance. Takes a `toiletdb` instance and a callback.

Options:

- `Dat`: Use provided dat factory instead of [dat-node](https://github.com/datproject/dat-node)

### multidat.create(dir, opts, callback(err, dat))
Create a new `dat` archive.

### dats = multidat.list()
List all available `dat` archives.

### multidat.close(key, callback(err))
Close and remove a `dat` archive.

### multidat.readManifest(dat, callback(err, manifest))
Read the `dat.json` file from the `dat` archive. This method is expected to be
deprecated once `dat` archives provide a built-in method to return archives.

## Why?
This package exists to manage multiple `dat` archives in different directories.
The [dat-node][dat-node] package is mostly stateless; all state is persisted
into the archives themselves. This package acts as a layer on top to keep track
of where archives are located and manage them between sessions.

## When not to use this
If you're running a server, it's usually enough to run
[mafintosh/hypercore-archiver](https://github.com/mafintosh/hypercore-archiver)
which is more consistent and simpler. If you're building a tool that only needs
to manage a single dat archive at the time it's recommended to use
[datproject/dat-node][dat-node] instead.

## See Also
- [datproject/dat-node][dat-node]
- [mafintosh/hyperdrive](https://github.com/mafintosh/hyperdrive)
- [mafintosh/hypercore-archiver](https://github.com/mafintosh/hypercore-archiver)
- [datproject/multidrive](https://github.com/datproject/multidrive)
- [juliangruber/hyperdrive-stats](https://github.com/juliangruber/hyperdrive-stats)
- [juliangruber/dat-encoding](https://github.com/juliangruber/dat-encoding)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/multidat.svg?style=flat-square
[3]: https://npmjs.org/package/multidat
[4]: https://img.shields.io/travis/datproject/multidat/master.svg?style=flat-square
[5]: https://travis-ci.org/datproject/multidat
[6]: https://img.shields.io/codecov/c/github/datproject/multidat/master.svg?style=flat-square
[7]: https://codecov.io/github/datproject/multidat
[8]: http://img.shields.io/npm/dm/multidat.svg?style=flat-square
[9]: https://npmjs.org/package/multidat
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
[dat]: https://github.com/datproject/dat
[dat-node]: https://github.com/datproject/dat-node
