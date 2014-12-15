'use strict';

var test = require('tape')
    , fs = require('fs')
    , path = require('path')
    , sassUtils = require('./sassUtils')
    , preconditions = require('./preconditions')
    , css = require('./')
    , cssFixtures = __dirname + '/test/fixtures/css/'
    , lessFixtures = __dirname + '/test/fixtures/less/'
    , sassFixtures = __dirname + '/test/fixtures/sass/'
    , scssFixtures = __dirname + '/test/fixtures/scss/'
    , buildbower = require('./buildbower')

buildbower(runTests)

function runTests() {

  test('compilable scss filename', function (t) {
    t.plan(1)
    t.ok(sassUtils.isCompilableFilePath('/dir/name.scss'))
  })

  test('not compilable scss filename (partial)', function (t) {
    t.plan(1)
    t.ok(!sassUtils.isCompilableFilePath('/dir/_name.scss'))
  })

  test('not compilable scss filename (css)', function (t) {
    t.plan(1)
    t.ok(!sassUtils.isCompilableFilePath('/dir/name.css'))
  })

  test('compilable scss filename (no directory)', function (t) {
    t.plan(1)
    t.ok(sassUtils.isCompilableFilePath('name.scss'))
  })

  test('not compilable scss filename (not extension)', function (t) {
    t.plan(1)
    t.ok(!sassUtils.isCompilableFilePath('/dir/namescss'))
  })

  test('not a partial scss filename, regular scss filename', function (t) {
    t.plan(1)

    t.ok(!sassUtils.isPartialFilename('/dir/name.scss'))
  })

  test('not a partial scss filename, not an scss filename', function (t) {
    t.plan(1)

    t.ok(!sassUtils.isPartialFilename('/dir/name.css'))
  })

  test('not a partial scss filename, not an sass filename', function (t) {
    t.plan(1)

    t.ok(!sassUtils.isPartialFilename('/dir/name.sass'))
  })

  test('a partial scss filename', function (t) {
    t.plan(1)

    t.ok(sassUtils.isPartialFilename('/dir/_name.scss'))
  })

  test('a partial sass filename', function (t) {
    t.plan(1)

    t.ok(sassUtils.isPartialFilename('/dir/_name.sass'))
  })

  test('preconditions errors should start with Atomify-CSS', function (t) {
    t.plan(1)

    t.throws(function () {
      preconditions.check(false, 'test error');
    }, /Atomify-CSS.*/)
  })

  test('preconditions checks should approve true conditions', function (t) {
    t.plan(1)

    t.doesNotThrow(function () {
      preconditions.check(true, 'testing preconditions');
    })
  })

    test('basic css bundling', function (t) {
        t.plan(2)

        var cfg = { entry: path.join(cssFixtures, 'entry.css') }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('basic multiple css bundling', function (t) {
        t.plan(2)

        var cfg = { entries: [ path.join(cssFixtures, 'entry.css'), path.join(cssFixtures, 'entry-multi.css')]  }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-multi.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('basic sass bundling', function (t) {
      t.plan(1)

      var cfg = { entry: path.join(sassFixtures, 'entry.sass') }
        , correct = fs.readFileSync(path.join(sassFixtures, 'bundle.css'), 'utf8')

      css(cfg, function (err, src) {
        t.equal(src, correct)
      })
    })

    test('basic scss bundling', function (t) {
      t.plan(1)

      var cfg = { entry: path.join(scssFixtures, 'entry.scss') }
        , correct = fs.readFileSync(path.join(scssFixtures, 'bundle.css'), 'utf8')

      css(cfg, function (err, src) {
        t.equal(src, correct)
      })
    })

  test('scss bundling with local import', function (t) {
    t.plan(1)

    var cfg = { entry: path.join(scssFixtures, 'entry-with-import.scss') }
      , correct = fs.readFileSync(path.join(scssFixtures, 'bundle-with-import.css'), 'utf8')

    css(cfg, function (err, src) {
      t.equal(src, correct)
    })
  })

  test('scss bundling with external import', function (t) {
    t.plan(1)

    var cfg = {
        entry: path.join(scssFixtures, 'entry-with-external-import.scss'),
        includePaths: [ 'test/fixtures/scss-external' ]
      }
      , correct = fs.readFileSync(path.join(scssFixtures, 'bundle-with-external-import.css'), 'utf8')

    css(cfg, function (err, src) {
      t.equal(src, correct)
    })
  })

  test('compiles variables', function (t) {
        t.plan(2)

        var cfg = { entry: path.join(cssFixtures, 'vars.css') }
            , correct = fs.readFileSync(path.join(cssFixtures, 'varBundle.css'), 'utf8').replace(/[\n]$/, '')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct, 'compiles the correct css')
        })
    })

    test('css bundling with variables', function (t) {
        t.plan(2)

        var cfg = { entries: [ path.join(cssFixtures, 'entry-with-var.css') ],
                variables: {
                    mainColor: '#4170BB',
                    headerColor: '#4170CC'
                }
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-with-var.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('css bundling with variables from a json file', function (t) {
        t.plan(2)

        var cfg = { entries: [ path.join(cssFixtures, 'entry-with-var.css') ],
                variables: path.join(cssFixtures, 'variables.json')
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-with-var.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('handling error from a json file malformed', function (t) {
        t.plan(4)

        var cfg = { entries: [ path.join(cssFixtures, 'entry-with-var.css') ],
            variables: path.join(cssFixtures, 'variables-malformed.json')
        }

        css(cfg, function (err) {
            t.ok(err instanceof Error, 'called callback with error')
            t.equal(err.message.indexOf('Unable to parse') > -1, true)
            t.equal(err.message.indexOf('variables-malformed.json') > -1, true)
            t.equal(err.message.indexOf("Unexpected token '") > -1, true)
        })
    })

    test('bower - basic css bundling', function (t) {
        t.plan(2)

        var cfg = { entry: path.join(cssFixtures, 'entry.css'), bower: true }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('basic less bundling', function (t) {
        t.plan(2)

        var cfg = { entry: path.join(lessFixtures, 'entry.less') }
            , correct = fs.readFileSync(path.join(lessFixtures, 'bundle.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('bower - basic less bundling', function (t) {
        t.plan(2)

        var cfg = { entry: path.join(lessFixtures, 'entry.less'), bower: true }
            , correct = fs.readFileSync(path.join(lessFixtures, 'bundle.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('less bundling with module name', function (t) {
        t.plan(2)

        var cfg = { entry: path.join(lessFixtures, 'entry-with-named-module.less') }
            , correct = fs.readFileSync(path.join(lessFixtures, 'bundle-with-named-module.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('transformation', function (t) {
        t.plan(2)

        var cfg = {
                entry: path.join(cssFixtures, 'entry.css'), transform: function (input) {
                    return input.split('background').join('color')
                }
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-transformed.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('opts as string', function (t) {
        t.plan(2)

        var cfg = path.join(cssFixtures, 'entry.css')
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('opts.output as property', function (t) {
        t.plan(1)

        var cfg = {
                entry: path.join(cssFixtures, 'entry.css'), output: path.join(cssFixtures, 'bundle-gen.css')
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle.css'), 'utf8')

        css(cfg)

        setTimeout(function () {
            t.equal(fs.readFileSync(cfg.output, 'utf8'), correct)
        }, 250)
    })

    test('opts.output as string', function (t) {
        t.plan(1)

        var correct = fs.readFileSync(path.join(cssFixtures, 'bundle.css'), 'utf8')
            , output = path.join(cssFixtures, 'bundle-gen.css')

        css(path.join(cssFixtures, 'entry.css'), output)

        setTimeout(function () {
            t.equal(fs.readFileSync(output, 'utf8'), correct)
        }, 250)
    })

    test('providing output property and callback writes file and calls callback', function (t) {
        t.plan(3)

        var cfg = {
                entry: path.join(cssFixtures, 'entry.css'), output: path.join(cssFixtures, 'bundle-gen.css')
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle.css'), 'utf8')

        if (fs.existsSync(cfg.output)) fs.unlinkSync(cfg.output)

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.ok(fs.existsSync(cfg.output), 'file written')
            t.equal(src, correct)
        })
    })

    test('opts.debug generates sourcemap', function (t) {
        t.plan(2)

        var cfg = {
                entry: path.join(cssFixtures, 'entry.css'), debug: true
            }
        // remove the trailing new line b/c rework tries to minimize its output
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-with-sourcemap.css'), 'utf8').replace(/[\n]$/, '')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('opts.compress compresses output', function (t) {
        t.plan(2)

        var cfg = {
                entry: path.join(cssFixtures, 'entry.css'), compress: true
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-compressed.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('opts.debug and opts.compress generates sourcemap and compresses', function (t) {
        t.plan(2)

        var cfg = {
                entry: path.join(cssFixtures, 'entry.css'), debug: true, compress: true
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-compressed-with-sourcemap.css'), 'utf8').replace(/[\n]$/, '')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('opts.assets', function (t) {
        t.plan(2)

        var cfg = {
                entry: path.join(cssFixtures, 'entry-with-asset.css'), assets: {
                    dest: path.join(cssFixtures, 'assets/images'), prefix: 'assets/images/'
                }
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-with-asset.css'), 'utf8').replace(/[\n]$/, '')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('opts.assets for LESS', function (t) {
        t.plan(2)

        var cfg = {
                entry: path.join(lessFixtures, 'entry-with-asset.less'), assets: {
                    dest: path.join(lessFixtures, 'assets/images'), prefix: 'assets/images/'
                }
            }
            , correct = fs.readFileSync(path.join(lessFixtures, 'bundle-with-asset.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('plugins are configurable', function (t) {
        t.plan(2)

        var cfg = {
                entry: path.join(cssFixtures, 'entry-with-inline.css'), plugins: [
                    ['rework-plugin-inline', __dirname + '/test']
                ]
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-with-inline.css'), 'utf8')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct.replace(/\n$/, ''))
        })
    })

    test('descendant modules can specify custom plugins', function (t) {
        t.plan(2)

        var cfg = {
                entry: path.join(cssFixtures, 'entry-with-deep-custom-plugins.css'), plugins: [
                    ['rework-clone']
                ]
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-with-deep-custom-plugins.css'), 'utf8').replace(/\n$/, '')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('bower - descendant modules can specify custom plugins', function (t) {
        t.plan(2)

        var cfg = {
                entry: path.join(cssFixtures, 'entry-with-deep-custom-plugins.css'), plugins: [
                    ['rework-clone']
                ]
                , bower: true
            }
            , correct = fs.readFileSync(path.join(cssFixtures, 'bundle-with-deep-custom-plugins.css'), 'utf8').replace(/\n$/, '')

        css(cfg, function (err, src) {
            t.error(err, 'does not error')
            t.equal(src, correct)
        })
    })

    test('handle importing errors', function (t) {
        t.plan(1)

        var cfg = {
            entry: path.join(cssFixtures, 'import-missing.css')
        }

        css(cfg, function (err) {
            t.ok(err instanceof Error, 'called callback with error')
        })
    })

    test('handle entry missing error', function (t) {
        t.plan(1)

        var cfg = {
            entry: path.join(cssFixtures, 'file-does-not-exist.css')
        }

        css(cfg, function (err) {
            t.ok(err instanceof Error, 'called callback with error')
        })
    })

    test('output to non-existent directory', function (t) {
        t.plan(1)

        var correct = fs.readFileSync(path.join(cssFixtures, 'bundle.css'), 'utf8')
            , output = path.join(cssFixtures, 'new-dir', 'bundle-new-dir.css')

        if (fs.existsSync(output)) fs.unlinkSync(output)

        css(path.join(cssFixtures, 'entry.css'), output)

        setTimeout(function () {
            t.equal(fs.readFileSync(output, 'utf8'), correct)
        }, 250)
    })

}
