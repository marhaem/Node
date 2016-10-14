/* */ 
var common = require('./common');
var fs = require('fs');
common.register('test', _test, {
  cmdOptions: {
    'b': 'block',
    'c': 'character',
    'd': 'directory',
    'e': 'exists',
    'f': 'file',
    'L': 'link',
    'p': 'pipe',
    'S': 'socket'
  },
  wrapOutput: false
});
function _test(options, path) {
  if (!path)
    common.error('no path given');
  var canInterpret = false;
  Object.keys(options).forEach(function(key) {
    if (options[key] === true) {
      canInterpret = true;
    }
  });
  if (!canInterpret)
    common.error('could not interpret expression');
  if (options.link) {
    try {
      return fs.lstatSync(path).isSymbolicLink();
    } catch (e) {
      return false;
    }
  }
  if (!common.existsSync(path))
    return false;
  if (options.exists)
    return true;
  var stats = fs.statSync(path);
  if (options.block)
    return stats.isBlockDevice();
  if (options.character)
    return stats.isCharacterDevice();
  if (options.directory)
    return stats.isDirectory();
  if (options.file)
    return stats.isFile();
  if (options.pipe)
    return stats.isFIFO();
  if (options.socket)
    return stats.isSocket();
  return false;
}
module.exports = _test;
