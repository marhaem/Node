/* */ 
(function(process) {
  "use strict";
  var os = require('os');
  var hasUnicode = module.exports = function() {
    if (os.type() == "Windows_NT") {
      return false;
    }
    var isUTF8 = /UTF-?8$/i;
    var ctype = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG;
    return isUTF8.test(ctype);
  };
})(require('process'));
