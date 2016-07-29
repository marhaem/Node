/*global require*/
/*jshint -W034*/

(function (){
  'use strict';

  let bunyan = require('bunyan');
  let logger = bunyan.createLogger( {name: 'webserver'} );

  let System = require("jspm").Loader();

  let reject = function reject(err) {
    if (err) {
      logger.error(err);
    }
  };

  System.import("./src/lib/Global.js").then((global) => {
    global = global.default;
    global.logger = logger;

    System.import("./src/index.js").then((index) => {
      index = index.default;

      index.start();
    }, reject).catch(reject);
  }, reject).catch(reject);
})();
//closure
