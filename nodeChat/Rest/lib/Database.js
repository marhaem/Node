/*jshint esnext:true*/

import Sequelize from 'sequelize';
import {Messages} from './Database/TableDefinitions/Messages';
import {Users} from './Database/TableDefinitions/Users';

export let Database = {
  init: function (sequelize) {
    let self = this;

    return new Promise(function (resolve, reject) {
      self.tables = [];
      self.tables.messages = sequelize.define(Messages.name, Messages.attributes, Messages.options);
      self.tables.users = sequelize.define(Users.name, Users.attributes, Users.options);

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
