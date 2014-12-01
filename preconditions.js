'use strict';

var preconditions = require('precondition')
  , _ = require('underscore')

module.exports = {
  check: function check() {
    var args = [].slice.call(arguments)
    var msg = args.length > 1 ? args[1] : null

    if (_.isString(msg)) {
      args[1] = 'Atomify-CSS error: ' + msg
    }

    preconditions.checkType.apply(undefined, args)
  }
}

