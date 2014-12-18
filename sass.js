var sass = require('node-sass')
  , sassUtil = require('./sassUtils')
  , utils = require('./utils')
  , preconditions = require('./preconditions')
  , clone = require('clone')

var ctor = module.exports = function (opts, cb) {
  preconditions.check(!!opts, 'Undefined options');
  preconditions.check(utils.isArray(opts.entries), 'Expected entries array but was %s', opts.entries);

  var compiled = []
  var error = null
  var sassOpts = opts.sass || {}

  var compilable = opts.entries.filter(sassUtil.isCompilableFilePath)

  if (compilable.length < 1) {
    process.nextTick(function () {cb(null, null)})
    return;
  }

  opts.entries.forEach(compile)

  function compile (entryPath) {
    if (error !== null) {
      return
    }

    var sassConfig = clone(sassOpts)
    sassConfig.file = entryPath
    sassConfig.data = null
    sassConfig.success = wrapSuccessFn(sassOpts.success)
    sassConfig.error = wrapErrorFn(sassOpts.error)
    sassConfig.outputStyle = opts.compress ? 'compressed' : 'nested'

    sass.render(sassConfig);
  }

  function wrapErrorFn (errorOpt) {
    return function (err) {
      fail(err)

      if (typeof errorOpt === 'function') {
        errorOpt(err)
      }
    }
  }

  function fail (err) {
    console.log(err);
    error = err
    process.nextTick(function () {cb(err)})
  }

  function wrapSuccessFn (successOpt) {
    return function (css) {
      bufferCss(css)

      if (typeof successOpt === 'function') {
        successOpt(css)
      }
    }
  }

  function bufferCss (css) {
    compiled.push(css)

    if (compiled.length >= compilable.length) {
      var allSrc = compiled.join(opts.compress ? '' : '\n')
      process.nextTick(function () {cb(null, allSrc)})
    }
  }

};
