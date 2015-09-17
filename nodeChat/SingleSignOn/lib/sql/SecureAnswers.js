/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  var SecureAnswers = sequelize.define('SecureAnswers', {
    id       : { type: DataTypes.INTEGER    , primaryKey: true, autoIncrement: true },
    // userId
    question : { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
    answer   : { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } }
    // createdAt
    // updatedAt
  }, {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }).belongsTo(sequelize.models.Users, { as: 'user' });

  return SecureAnswers;
};