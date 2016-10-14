/* */ 
var common = require('./common');
var fs = require('fs');
var path = require('path');
common.register('toEnd', _toEnd, {
  pipeOnly: true,
  wrapOutput: false
});
function _toEnd(options, file) {
  if (!file)
    common.error('wrong arguments');
  if (!common.existsSync(path.dirname(file))) {
    common.error('no such file or directory: ' + path.dirname(file));
  }
  try {
    fs.appendFileSync(file, this.stdout || this.toString(), 'utf8');
    return this;
  } catch (e) {
    common.error('could not append to file (code ' + e.code + '): ' + file, true);
  }
}
module.exports = _toEnd;
