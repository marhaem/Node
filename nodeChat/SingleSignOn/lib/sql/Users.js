/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  return sequelize.define('Users', {
    id                     : { type: DataTypes.BIGINT     , primaryKey: true, autoIncrement: true },
    email                  : { type: DataTypes.STRING(64) , allowNull: false, unique: true, validate: { isEmail: true, notEmpty: true } },
    emailVerifiedAt        : { type: DataTypes.DATE       , allowNull: true },
    username               : { type: DataTypes.STRING(32) , allowNull: true , unique: true, validate: { notEmpty: true } },
    isLocked               : { type: DataTypes.BOOLEAN    , allowNull: false, defaultValue: false },
    isSuspended            : { type: DataTypes.BOOLEAN    , allowNull: false, defaultValue: false },
    passwordHash           : { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
    passwordSalt           : { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
    passwordMismatchCount  : { type: DataTypes.INTEGER    , allowNull: false, defaultValue: 0 },
    passwordLastMismatchAt : { type: DataTypes.DATE       , allowNull: true },
    passwordTimestamp      : { type: DataTypes.DATE       , allowNull: false, defaultValue: DataTypes.NOW },
    passwordIsTemporary    : { type: DataTypes.BOOLEAN    , allowNull: false, defaultValue: true },
    firstName              : { type: DataTypes.STRING(32) , allowNull: true , validate: { notEmpty: true } },
    lastName               : { type: DataTypes.STRING(32) , allowNull: true , validate: { notEmpty: true } },
    dateOfBirth            : { type: DataTypes.DATE       , allowNull: true },
    language               : { type: DataTypes.STRING(2)  , allowNull: false, defaultValue: 'en', validate: { notEmpty: true } },
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