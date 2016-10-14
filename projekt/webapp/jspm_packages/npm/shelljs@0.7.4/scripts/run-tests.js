/* */ 
(function(process) {
  require('../global');
  var failed = false;
  cd(__dirname + '/../test');
  ls('*.js').forEach(function(file) {
    echo('Running test:', file);
    if (exec(JSON.stringify(process.execPath) + ' ' + file).code !== 123) {
      failed = true;
      echo('*** TEST FAILED! (missing exit code "123")');
      echo();
    }
  });
  echo();
  if (failed) {
    echo('*******************************************************');
    echo('WARNING: Some tests did not pass!');
    echo('*******************************************************');
    exit(1);
  } else {
    echo('All tests passed.');
  }
})(require('process'));
