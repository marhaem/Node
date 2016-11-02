/* */ 
(function(process) {
  'use strict';
  Object.defineProperty(exports, '__esModule', {value: true});
  exports['default'] = commandConvert;
  var envUseUnixRegex = /\$(\w+)/g;
  var envUseWinRegex = /\%(.*?)\%/g;
  var isWin = process.platform === 'win32';
  var envExtract = isWin ? envUseUnixRegex : envUseWinRegex;
  function commandConvert(command) {
    var match = envExtract.exec(command);
    if (match) {
      command = isWin ? '%' + match[1] + '%' : '$' + match[1];
    }
    return command;
  }
  module.exports = exports['default'];
})(require('process'));
