import Sequelize from 'sequelize';

export let db = {
  init: function (db) {
    return new Promise(function (resolved, rejected) {
      var sequelize = db;
      
      sequelize.sync({
        force: true
      }).then(
        function() {
          console.log('presence');
          resolved(sequelize);
        }).catch(
        function(error) {
          console.log('fucked up');
          rejected(error);
        });
    });
  }
};
