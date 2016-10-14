/* */ 
var common = require('./common');
var fs = require('fs');
common.register('cat', _cat, {canReceivePipe: true});
function _cat(options, files) {
  var cat = common.readFromPipe();
  if (!files && !cat)
    common.error('no paths given');
  files = [].slice.call(arguments, 1);
  files.forEach(function(file) {
    if (!common.existsSync(file)) {
      common.error('no such file or directory: ' + file);
    }
    cat += fs.readFileSync(file, 'utf8');
  });
  return cat;
}
module.exports = _cat;
