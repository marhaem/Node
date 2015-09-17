/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  return sequelize.define('SecureQuestions', {
    id       : { type: DataTypes.INTEGER    , primaryKey: true, autoIncrement: true },
    language : { type: DataTypes.STRING(2)  , allowNull: false, validate: { notEmpty: true } },
    question : { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } }
    // createdAt
    // updatedAt
  }, {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
};