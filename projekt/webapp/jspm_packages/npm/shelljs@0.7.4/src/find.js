/* */ 
var fs = require('fs');
var path = require('path');
var common = require('./common');
var _ls = require('./ls');
common.register('find', _find, {});
function _find(options, paths) {
  if (!paths) {
    common.error('no path specified');
  } else if (typeof paths === 'string') {
    paths = [].slice.call(arguments, 1);
  }
  var list = [];
  function pushFile(file) {
    if (common.platform === 'win') {
      file = file.replace(/\\/g, '/');
    }
    list.push(file);
  }
  paths.forEach(function(file) {
    pushFile(file);
    if (fs.statSync(file).isDirectory()) {
      _ls({
        recursive: true,
        all: true
      }, file).forEach(function(subfile) {
        pushFile(path.join(file, subfile));
      });
    }
  });
  return list;
}
module.exports = _find;
