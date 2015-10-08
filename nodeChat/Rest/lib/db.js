var Sequelize = require('sequelize');

module.exports = {
    init: function(cb) {
        var sequelize = new Sequelize('nodeChat', 'wAppUser', 'work', {
            host: 'localhost',
            dialect: 'postgres'
        });
        sequelize.sync({ force: true }).then(function syncFulfilled() {
          return cb(sequelize);
        }, function syncRejected(error){
          //
        });
    }
};

/*(function(){
  var sequelize = new Sequelize('nodeChat', 'webappuser', 'work', {
    host: 'localhost',
    dialect: 'postgres'
  });

  var user = tableUser.define(sequelize);
  var message = tableMessage.define(sequelize);

  return sequelize;
});*/