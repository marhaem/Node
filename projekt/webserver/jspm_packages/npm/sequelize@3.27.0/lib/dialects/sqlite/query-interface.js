/* */ 
'use strict';
var Utils = require('../../utils'),
    Promise = require('../../promise');
var removeColumn = function(tableName, attributeName, options) {
  var self = this;
  options = options || {};
  return this.describeTable(tableName, options).then(function(fields) {
    delete fields[attributeName];
    var sql = self.QueryGenerator.removeColumnQuery(tableName, fields),
        subQueries = sql.split(';').filter(function(q) {
          return q !== '';
        });
    return Promise.each(subQueries, function(subQuery) {
      return self.sequelize.query(subQuery + ';', Utils._.assign({raw: true}, options));
    });
  });
};
var changeColumn = function(tableName, attributes, options) {
  var attributeName = Utils._.keys(attributes)[0],
      self = this;
  options = options || {};
  return this.describeTable(tableName, options).then(function(fields) {
    fields[attributeName] = attributes[attributeName];
    var sql = self.QueryGenerator.removeColumnQuery(tableName, fields),
        subQueries = sql.split(';').filter(function(q) {
          return q !== '';
        });
    return Promise.each(subQueries, function(subQuery) {
      return self.sequelize.query(subQuery + ';', Utils._.assign({raw: true}, options));
    });
  });
};
var renameColumn = function(tableName, attrNameBefore, attrNameAfter, options) {
  var self = this;
  options = options || {};
  return this.describeTable(tableName, options).then(function(fields) {
    fields[attrNameAfter] = Utils._.clone(fields[attrNameBefore]);
    delete fields[attrNameBefore];
    var sql = self.QueryGenerator.renameColumnQuery(tableName, attrNameBefore, attrNameAfter, fields),
        subQueries = sql.split(';').filter(function(q) {
          return q !== '';
        });
    return Promise.each(subQueries, function(subQuery) {
      return self.sequelize.query(subQuery + ';', Utils._.assign({raw: true}, options));
    });
  });
};
module.exports = {
  removeColumn: removeColumn,
  changeColumn: changeColumn,
  renameColumn: renameColumn
};
