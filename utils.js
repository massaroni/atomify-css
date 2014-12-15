'use strict';

module.exports = {
  // from underscore.js
  isArray: Array.isArray || function (a) {
    return toString.call(obj) === '[object Array]';
  }
}
