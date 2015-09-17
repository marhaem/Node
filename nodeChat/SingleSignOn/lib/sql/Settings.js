/*global module */

module.exports = function(sequelize, DataTypes) {
  'use strict';

  return sequelize.define('Settings', {
    id                            : { type: DataTypes.INTEGER(4), primaryKey: true, autoIncrement: true },
    passwordValidForDays          : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 180 },
    passwordMaxErrorCount         : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 3 },
    passwordHistoryCount          : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 5 },
    passwordChangeDelaySeconds    : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 90 },
    passwordComplexityMinLength   : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 8 },
    passwordComplexityMinDigits   : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 1 },
    passwordComplexityMinLower    : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 1 },
    passwordComplexityMinUpper    : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 1 },
    passwordComplexityMinSymbols  : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 1 },
    temporaryPasswordTtlMinutes   : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 4320 },
    secureQuestionAnswerMinLength : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 8 },
    secureQuestionHistoryCount    : { type: DataTypes.INTEGER   , allowNull: false, defaultValue: 3 }
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