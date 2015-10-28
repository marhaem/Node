/*jshint esnext:true */

import Sequelize from 'sequelize';
import {db} from '../db';

export let messageTable = {
  index: function index() {
    return db.sequelize.define('Messages', {
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
