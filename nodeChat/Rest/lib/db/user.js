import Sequelize from 'sequelize'; 

export let user = {
  define: function (sequelize) {
    return sequelize.define('User', {
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
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

/*function define(sequelize) {
  return sequelize.define('user', {
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    }
  });
};
*/
