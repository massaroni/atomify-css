'use strict';

var preconditions = require('precondition')

module.exports = {
  check: function check() {
    var args = [].slice.call(arguments)
    var msg = args.length > 1 ? args[1] : null

    if (typeof msg === 'string') {
      args[1] = 'Atomify-CSS error: ' + msg
    }

    preconditions.checkType.apply(undefined, args)
  }
}

