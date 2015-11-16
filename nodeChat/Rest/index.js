/*global System*/
/*jshint esnext:true, -W069*/

import {Database} from './lib/Database';

export let index = {
  start: function (Bunyan, sequelize) {
    return new Promise(function (resolve, reject) {
      Database.init(sequelize).then(
        function dbInitResolved(_sequelize) {
          System.import('./lib/webserver').then(
            function importResolved(WebServer) {
              WebServer = WebServer.WebServer;

              WebServer.init(Bunyan).then(resolve, reject);
            },
            reject
          );
        },
        reject
      );
    });
  }
};
