/*jshint esnext:true*/

import Sequelize from 'sequelize';

export let Messages = {
  name: 'Messages',
  attributes: {
    message: {
      type: Sequelize.STRING
    },
    from: {
      type: Sequelize.INTEGER
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
