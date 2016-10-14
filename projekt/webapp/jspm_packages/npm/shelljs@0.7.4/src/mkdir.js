/* */ 
var common = require('./common');
var fs = require('fs');
var path = require('path');
common.register('mkdir', _mkdir, {cmdOptions: {'p': 'fullpath'}});
function mkdirSyncRecursive(dir) {
  var baseDir = path.dirname(dir);
  if (baseDir === dir) {
    common.error('dirname() failed: [' + dir + ']');
  }
  if (common.existsSync(baseDir)) {
    fs.mkdirSync(dir, parseInt('0777', 8));
    return;
  }
  mkdirSyncRecursive(baseDir);
  fs.mkdirSync(dir, parseInt('0777', 8));
}
function _mkdir(options, dirs) {
  if (!dirs)
    common.error('no paths given');
  if (typeof dirs === 'string') {
    dirs = [].slice.call(arguments, 1);
  }
  dirs.forEach(function(dir) {
    try {
      fs.lstatSync(dir);
      if (!options.fullpath) {
        common.error('path already exists: ' + dir, true);
      }
      return;
    } catch (e) {}
    var baseDir = path.dirname(dir);
    if (!common.existsSync(baseDir) && !options.fullpath) {
      common.error('no such file or directory: ' + baseDir, true);
      return;
    }
    try {
      if (options.fullpath) {
        mkdirSyncRecursive(dir);
      } else {
        fs.mkdirSync(dir, parseInt('0777', 8));
      }
    } catch (e) {
      if (e.code === 'EACCES') {
        common.error('cannot create directory ' + dir + ': Permission denied');
      } else {
        throw e;
      }
    }
  });
  return '';
}
module.exports = _mkdir;
