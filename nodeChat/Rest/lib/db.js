/*jshint esnext:true */

import Sequelize from 'sequelize';

export let db = {
  init: function (sequelize) {
    let self = this;

    return new Promise(function (resolve, reject) {
      sequelize.sync({
        force: true
      }).then(
        function() {
          console.log('Database Initialization: OK');
          self.sequelize = sequelize;
          resolve(sequelize);
        },
        function(error) {
          console.log('Database Initialization: ERROR');
          reject(error);
        }
      );
    });
  }
};
