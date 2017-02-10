# multidat [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Manage multiple [dat][dat] instances.

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

## API
### Multidat(db, callback(err, multidat))
Creat a new Multidat instance. Takes a `toiletdb` instance and a callback.

### multidat.create(opts, callback(err, dat))
Create a new `dat` archive.

### dats = multidat.list()
List all available `dat` archives.

### multidat.close(key, callback(err))
Close and remove a `dat` archive.

### multidat.readManifest(dat, callback(err, manifest))
Read the `dat.json` file from the `dat` archive. This method is expected to be
deprecated once `dat` archives provide a built-in method to return archives.

## See Also
- [datproject/dat][dat]
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
