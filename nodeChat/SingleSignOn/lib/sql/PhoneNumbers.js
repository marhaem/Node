/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  var PhoneNumbers = sequelize.define('PhoneNumbers', {
    id         : { type: DataTypes.INTEGER   , primaryKey: true, autoIncrement: true },
    // userId (FK)
    number     : { type: DataTypes.STRING(64), allowNull: false, validate: { notEmpty: true } },
    title      : { type: DataTypes.STRING(32), allowNull: false, validate: { notEmpty: true } },
    verifiedAt : { type: DataTypes.DATE      , allowNull: true }
    // createdAt
    // updatedAt
  }, {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }).belongsTo(sequelize.models.Users, { as: 'user' });

  return PhoneNumbers;
};