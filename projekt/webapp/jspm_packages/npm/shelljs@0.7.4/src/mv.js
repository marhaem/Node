/* */ 
var fs = require('fs');
var path = require('path');
var common = require('./common');
var cp = require('./cp');
var rm = require('./rm');
common.register('mv', _mv, {cmdOptions: {
    'f': '!no_force',
    'n': 'no_force'
  }});
function _mv(options, sources, dest) {
  if (arguments.length < 3) {
    common.error('missing <source> and/or <dest>');
  } else if (arguments.length > 3) {
    sources = [].slice.call(arguments, 1, arguments.length - 1);
    dest = arguments[arguments.length - 1];
  } else if (typeof sources === 'string') {
    sources = [sources];
  } else {
    common.error('invalid arguments');
  }
  var exists = common.existsSync(dest);
  var stats = exists && fs.statSync(dest);
  if ((!exists || !stats.isDirectory()) && sources.length > 1) {
    common.error('dest is not a directory (too many sources)');
  }
  if (exists && stats.isFile() && options.no_force) {
    common.error('dest file already exists: ' + dest);
  }
  sources.forEach(function(src) {
    if (!common.existsSync(src)) {
      common.error('no such file or directory: ' + src, true);
      return;
    }
    var thisDest = dest;
    if (common.existsSync(dest) && fs.statSync(dest).isDirectory()) {
      thisDest = path.normalize(dest + '/' + path.basename(src));
    }
    if (common.existsSync(thisDest) && options.no_force) {
      common.error('dest file already exists: ' + thisDest, true);
      return;
    }
    if (path.resolve(src) === path.dirname(path.resolve(thisDest))) {
      common.error('cannot move to self: ' + src, true);
      return;
    }
    try {
      fs.renameSync(src, thisDest);
    } catch (e) {
      if (e.code === 'EXDEV') {
        cp('-r', src, thisDest);
        rm('-rf', src);
      }
    }
  });
  return '';
}
module.exports = _mv;
