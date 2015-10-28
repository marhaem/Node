/*jshint esnext:true*/

import {db} from './lib/db';
import {WebServer} from './lib/webserver';

export let index = {
  start: function (sequelize) {
    return new Promise(function (resolve, reject) {
      db.init(sequelize).then(
        function dbInitResolved(_sequelize) {
          WebServer.init().then(resolve, reject);
        },
        reject
      );
    });
  }
};
