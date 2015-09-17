/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  var MailQueue = sequelize.define('MailQueue', {
    id   : { type: DataTypes.INTEGER   , primaryKey: true, autoIncrement: true },
    // userId (fk)
    type : { type: DataTypes.INTEGER(4), allowNull: false }
    // createdAt
  }, {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    createdAt: 'createdAt',
    updatedAt: false
  }).belongsTo(sequelize.models.Users, { as: 'user' });

  return MailQueue;
};