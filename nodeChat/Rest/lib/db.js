import pg from 'pg';
import pgHstore from 'pg-hstore';
import Sequelize from 'sequelize';

export let db = {
  init: function () {
    return new Promise(function (resolved, rejected) {
      var sequelize = new Sequelize('nodeChat', 'wAppUser', 'work', {
        host: 'localhost',
        dialect: 'postgres',
        native: false
      });
      sequelize.sync({
        force: true
      }).then(
        function() {
          console.log('presence');
          resolved(sequelize);
        }).catch(
        function(error) {
          rejected(error);
          console.log('fucked up');
        });
    });
  }
};

/*(function(){
  var sequelize = new Sequelize('nodeChat', 'webappuser', 'work', {
    host: 'localhost',
    dialect: 'postgres'
  });
as
  var user = tableUser.define(sequelize);
  var message = tableMessage.define(sequelize);

  return sequelize;
});*/
