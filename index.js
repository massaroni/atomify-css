'use strict';

var css = require('./css')
  , less = require('./less')
  , sass = require('./sass')
  , sassUtils = require('./sassUtils')
  , fs = require('fs')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , writer = require('write-to-path')
  , clone = require('clone')

module.exports = function (opts, cb) {
  if (typeof opts === 'string') opts = {entry: opts};
  if (typeof cb === 'string') opts.output = cb;
  if (opts.entry) opts.entries = [opts.entry];

  var compiled = []
  var error = null
  var compilers = 3

  compile(less, isLessFilename)
  compile(css, isCssFilename)
  compile(sass, sassUtils.isCompilableFilePath)

  function compile (compilerFn, entryFilterFn) {
    var compilable = opts.entries.filter(entryFilterFn)

    if (compilable.length < 1) {
      bufferCss()
      return
    }

    var newopts = clone(opts)
    newopts.entries = compilable
    compilerFn(opts, bufferCss)
  }

  function bufferCss (err, src) {
    if (!!err) {
      error = err
    }

    if (!!src) {
      compiled.push(src)
    }

    compilers--
    complete()
  }

  function complete () {
    if (compilers > 0 && error === null) {
      return
    }

    var err = error
    var src = compiled.join(opts.compress ? '' : '\n')

    if (opts.transform && !err) src = opts.transform(src)

    if (opts.output) {
      // we definitely have to write the file
      var outputPath = path.resolve(process.cwd(), opts.output)
        , outputDir = path.dirname(outputPath)
        , writeFile = writer(outputPath, {debug: opts.debug})

      if (!fs.existsSync(outputDir)) mkdirp.sync(outputDir)

      // we might need to call a callback also
      if (typeof cb === 'function') {
        var _cb = cb
        cb = function (err, src) {
          if (err) return _cb(err)

          writeFile(null, src)
          _cb(null, src)
        }
      } else {
        cb = writeFile
      }
    }

    cb(err, src)
  }

  function isLessFilename (filename) {
    return typeof filename === 'string' && filename.substr(-4).toLowerCase() === 'less';
  }

  function isCssFilename (filename) {
    return typeof filename === 'string' && !isLessFilename(filename) && !sassUtils.isSassFilePath(filename);
  }
}
