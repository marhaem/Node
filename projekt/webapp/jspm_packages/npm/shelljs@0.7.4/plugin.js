/* */ 
require('./shell');
var common = require('./src/common');
var exportedAttributes = ['error', 'parseOptions', 'readFromPipe', 'register'];
exportedAttributes.forEach(function(attr) {
  exports[attr] = common[attr];
});
