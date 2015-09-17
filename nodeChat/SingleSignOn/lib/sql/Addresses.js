/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  var Addresses = sequelize.define('Addresses', {
    id            : { type: DataTypes.INTEGER   , primaryKey: true, autoIncrement: true },
    // userId (FK)
    land          : { type: DataTypes.STRING(32), allowNull: false, validate: { notEmpty: true } },
    zip           : { type: DataTypes.INTEGER(8), allowNull: true },
    city          : { type: DataTypes.STRING(64), allowNull: true, validate: { notEmpty: true } },
    street        : { type: DataTypes.STRING(64), allowNull: true, validate: { notEmpty: true } },
    number        : { type: DataTypes.INTEGER(4), allowNull: true },
    postOfficeBox : { type: DataTypes.STRING(64), allowNull: true, validate: { notEmpty: true } }
    // createdAt
    // updatedAt
  }, {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }).belongsTo(sequelize.models.Users, { as: 'user' });

  return Addresses;
};