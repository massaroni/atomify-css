var sass = require('node-sass')
  , sassUtil = require('./sassUtils')
  , utils = require('./utils')
  , preconditions = require('./preconditions')

var ctor = module.exports = function (opts, cb) {
  preconditions.check(!!opts, 'Undefined options');
  preconditions.check(utils.isArray(opts.entries), 'Expected entries array but was %s', opts.entries);

  var compiled = []
  var error = null

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

    sass.render({
      file: entryPath,
      success: bufferCss,
      error: fail,
      includePaths: opts.includePaths,
      outputStyle: opts.compress ? 'compressed' : 'nested'
    });
  }

  function fail (err) {
    console.log(err);
    error = err
    process.nextTick(function () {cb(err)})
  }

  function bufferCss (css) {
    compiled.push(css)

    if (compiled.length >= compilable.length) {
      var allSrc = compiled.join(opts.compress ? '' : '\n')
      process.nextTick(function () {cb(null, allSrc)})
    }
  }

};
