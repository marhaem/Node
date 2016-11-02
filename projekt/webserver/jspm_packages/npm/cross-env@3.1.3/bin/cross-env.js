/* */ 
(function(process) {
  require('../dist/index')(process.argv.slice(2));
})(require('process'));
