var Sequelize = require('sequelize');

module.exports = {
  define: function (sequelize) {
    return sequelize.define('Messages', {
      message: {
        type: Sequelize.STRING
      },
      from: {
        type: Sequelize.INTEGER
      }
    }, {
      freezeTableName: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
      createdAt: 'timestamp',
      updatedAt: false
    });
  }
};
