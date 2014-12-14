'use strict';

var path = require('path')

module.exports = {
  isSassFilePath: isSassFilePath,
  isCompilableFilePath: isCompilableFilePath,
  isPartialFilename: isPartialFilename
}

function isSassFilePath (fullpath) {
  var ext = path.extname(fullpath).toLowerCase()
  return ext === '.sass' || ext === '.scss'
}

/**
 * "partial" sass file names start with an _ and they're not intended
 * to be compiled on their own, they're to be imported by other sass files.
 */
function isPartialFilename (fullpath) {
  if (!isSassFilePath(fullpath)) {
    return false
  }

  var filename = path.basename(fullpath)
  return filename.length > 0 && filename[0] === '_'
}

/**
 * "entry" files are compilable.
 *
 * @param fullPath
 */
function isCompilableFilePath (fullPath) {
  return isSassFilePath(fullPath) && !isPartialFilename(fullPath);
}
