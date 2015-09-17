/*global require, module, define, console, setTimeout, __dirname */
/*jshint -W014 */

(function () {
  'use strict';

  var path = require('path');
  var globals = require('../globals');
  var sqlConfig = globals.config.sql;
  var Sequelize = require('sequelize');

  var Database = module.exports = new Sequelize(sqlConfig.database, sqlConfig.username, sqlConfig.password, {
    host: sqlConfig.host,
    port: sqlConfig.port,
    dialect: sqlConfig.dialect,
    schema: sqlConfig.schema,
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    logging: false
  });
  var tables = ['Settings', 'Users', 'MailQueue', 'PasswordHistory', 'SecureQuestions', 'SecureAnswers', 'PhoneNumbers', 'Addresses', 'CreditCards', 'BankAccounts'];

  var Settings = Database.import(path.join(__dirname, 'Settings'));
  var Users = Database.import(path.join(__dirname, 'Users'));
  var MailQueue = Database.import(path.join(__dirname, 'MailQueue'));
  var PasswordHistory = Database.import(path.join(__dirname, 'PasswordHistory'));
  var SecureQuestions = Database.import(path.join(__dirname, 'SecureQuestions'));
  var SecureAnswers = Database.import(path.join(__dirname, 'SecureAnswers'));
  var PhoneNumbers = Database.import(path.join(__dirname, 'PhoneNumbers'));
  var Addresses = Database.import(path.join(__dirname, 'Addresses'));
  var CreditCards = Database.import(path.join(__dirname, 'CreditCards'));
  var BankAccounts = Database.import(path.join(__dirname, 'BankAccounts'));

  Database.sync().then(function syncCB() {
    //
  });
})();