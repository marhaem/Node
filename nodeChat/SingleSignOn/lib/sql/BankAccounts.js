/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  var BankAccounts = sequelize.define('BankAccounts', {
    id         : { type: DataTypes.INTEGER   , primaryKey: true, autoIncrement: true },
    // userId (FK)
    bic        : { type: DataTypes.STRING(11), allowNull: false, validate: { notEmpty: true } },
    iban       : { type: DataTypes.STRING(34), allowNull: false, validate: { notEmpty: true } },
    owner      : { type: DataTypes.STRING(32), allowNull: false },
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

  return BankAccounts;
};