/*jshint esnext:true */

import Sequelize from 'sequelize';
import {db} from '../db';

export let user = {
  define: function () {
    return db.sequelize.define('User', {
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
