/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  var CreditCards = sequelize.define('CreditCards', {
    id           : { type: DataTypes.INTEGER   , primaryKey: true, autoIncrement: true },
    // userId (FK)
    type         : { type: DataTypes.STRING(32), allowNull: false, validate: { notEmpty: true } },
    nameOnCard   : { type: DataTypes.STRING(32), allowNull: false, validate: { notEmpty: true } },
    number       : { type: DataTypes.STRING(19), allowNull: false },
    validFrom    : { type: DataTypes.DATE      , allowNull: false },
    validTo      : { type: DataTypes.DATE      , allowNull: false },
    securityCode : { type: DataTypes.STRING(3) , allowNull: false },
    verifiedAt   : { type: DataTypes.DATE      , allowNull: true }
    // createdAt
    // updatedAt
  }, {
    freezeTableName: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }).belongsTo(sequelize.models.Users, { as: 'user' });

  return CreditCards;
};