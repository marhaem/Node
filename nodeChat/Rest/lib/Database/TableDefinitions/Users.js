/*jshint esnext:true*/

import Sequelize from 'sequelize';

export let Users = {
  name: 'Users',
  attributes: {
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    }
  },
  options: {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    createdAt: 'timestamp',
    updatedAt: false
  }
};
