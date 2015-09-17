/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  var PasswordHistory = sequelize.define('PasswordHistory', {
    id           : { type: DataTypes.INTEGER    , primaryKey: true, autoIncrement: true },
    // userId (fk)
    hash         : { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
    salt         : { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
    timestamp    : { type: DataTypes.DATE       , allowNull: false },
    wasTemporary : { type: DataTypes.BOOLEAN    , allowNull: false }
  }, {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    createdAt: false,
    updatedAt: false
  }).belongsTo(sequelize.models.Users, { as: 'user' });

  return PasswordHistory;
};