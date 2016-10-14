/* */ 
(function(process) {
  var common = require('./common');
  var os = require('os');
  var fs = require('fs');
  common.register('tempdir', _tempDir, {
    allowGlobbing: false,
    wrapOutput: false
  });
  function writeableDir(dir) {
    if (!dir || !common.existsSync(dir))
      return false;
    if (!fs.statSync(dir).isDirectory())
      return false;
    var testFile = dir + '/' + common.randomFileName();
    try {
      fs.writeFileSync(testFile, ' ');
      common.unlinkSync(testFile);
      return dir;
    } catch (e) {
      return false;
    }
  }
  function _tempDir() {
    var state = common.state;
    if (state.tempDir)
      return state.tempDir;
    state.tempDir = writeableDir(os.tmpdir && os.tmpdir()) || writeableDir(os.tmpDir && os.tmpDir()) || writeableDir(process.env.TMPDIR) || writeableDir(process.env.TEMP) || writeableDir(process.env.TMP) || writeableDir(process.env.Wimp$ScrapDir) || writeableDir('C:\\TEMP') || writeableDir('C:\\TMP') || writeableDir('\\TEMP') || writeableDir('\\TMP') || writeableDir('/tmp') || writeableDir('/var/tmp') || writeableDir('/usr/tmp') || writeableDir('.');
    return state.tempDir;
  }
  module.exports = _tempDir;
})(require('process'));
