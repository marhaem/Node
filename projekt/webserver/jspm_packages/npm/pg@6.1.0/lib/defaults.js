/* */ 
(function(process) {
  var defaults = module.exports = {
    host: 'localhost',
    user: process.platform === 'win32' ? process.env.USERNAME : process.env.USER,
    database: process.platform === 'win32' ? process.env.USERNAME : process.env.USER,
    password: null,
    connectionString: undefined,
    port: 5432,
    rows: 0,
    binary: false,
    poolSize: 10,
    poolIdleTimeout: 30000,
    reapIntervalMillis: 1000,
    returnToHead: false,
    poolLog: false,
    client_encoding: "",
    ssl: false,
    application_name: undefined,
    fallback_application_name: undefined,
    parseInputDatesAsUTC: false
  };
  module.exports.__defineSetter__("parseInt8", function(val) {
    require('pg-types').setTypeParser(20, 'text', val ? parseInt : function(val) {
      return val;
    });
  });
})(require('process'));
