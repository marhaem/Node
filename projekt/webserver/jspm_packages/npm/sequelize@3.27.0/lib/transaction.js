/* */ 
'use strict';
var Utils = require('./utils'),
    uuid = require('node-uuid');
var Transaction = module.exports = function(sequelize, options) {
  this.sequelize = sequelize;
  this.savepoints = [];
  this.options = Utils._.extend({
    autocommit: true,
    type: sequelize.options.transactionType,
    isolationLevel: sequelize.options.isolationLevel
  }, options || {});
  this.parent = this.options.transaction;
  this.id = this.parent ? this.parent.id : uuid.v4();
  if (this.parent) {
    this.id = this.parent.id;
    this.parent.savepoints.push(this);
    this.name = this.id + '-savepoint-' + this.parent.savepoints.length;
  } else {
    this.id = this.name = uuid.v4();
  }
  delete this.options.transaction;
};
Transaction.TYPES = {
  DEFERRED: 'DEFERRED',
  IMMEDIATE: 'IMMEDIATE',
  EXCLUSIVE: 'EXCLUSIVE'
};
Transaction.ISOLATION_LEVELS = {
  READ_UNCOMMITTED: 'READ UNCOMMITTED',
  READ_COMMITTED: 'READ COMMITTED',
  REPEATABLE_READ: 'REPEATABLE READ',
  SERIALIZABLE: 'SERIALIZABLE'
};
Transaction.LOCK = Transaction.prototype.LOCK = {
  UPDATE: 'UPDATE',
  SHARE: 'SHARE',
  KEY_SHARE: 'KEY SHARE',
  NO_KEY_UPDATE: 'NO KEY UPDATE'
};
Transaction.prototype.commit = function() {
  var self = this;
  if (this.finished) {
    throw new Error('Transaction cannot be committed because it has been finished with state: ' + self.finished);
  }
  this.$clearCls();
  return this.sequelize.getQueryInterface().commitTransaction(this, this.options).finally(function() {
    self.finished = 'commit';
    if (!self.parent) {
      return self.cleanup();
    }
    return null;
  });
};
Transaction.prototype.rollback = function() {
  var self = this;
  if (this.finished) {
    throw new Error('Transaction cannot be rolled back because it has been finished with state: ' + self.finished);
  }
  this.$clearCls();
  return this.sequelize.getQueryInterface().rollbackTransaction(this, this.options).finally(function() {
    if (!self.parent) {
      return self.cleanup();
    }
    return self;
  });
};
Transaction.prototype.prepareEnvironment = function() {
  var self = this;
  return Utils.Promise.resolve(self.parent ? self.parent.connection : self.sequelize.connectionManager.getConnection({uuid: self.id})).then(function(connection) {
    self.connection = connection;
    self.connection.uuid = self.id;
  }).then(function() {
    return self.begin();
  }).then(function() {
    return self.setDeferrable();
  }).then(function() {
    return self.setIsolationLevel();
  }).then(function() {
    return self.setAutocommit();
  }).catch(function(setupErr) {
    return self.rollback().finally(function() {
      throw setupErr;
    });
  }).tap(function() {
    if (self.sequelize.constructor.cls) {
      self.sequelize.constructor.cls.set('transaction', self);
    }
    return null;
  });
};
Transaction.prototype.begin = function() {
  return this.sequelize.getQueryInterface().startTransaction(this, this.options);
};
Transaction.prototype.setDeferrable = function() {
  if (this.options.deferrable) {
    return this.sequelize.getQueryInterface().deferConstraints(this, this.options);
  }
};
Transaction.prototype.setAutocommit = function() {
  return this.sequelize.getQueryInterface().setAutocommit(this, this.options.autocommit, this.options);
};
Transaction.prototype.setIsolationLevel = function() {
  return this.sequelize.getQueryInterface().setIsolationLevel(this, this.options.isolationLevel, this.options);
};
Transaction.prototype.cleanup = function() {
  var res = this.sequelize.connectionManager.releaseConnection(this.connection);
  this.connection.uuid = undefined;
  return res;
};
Transaction.prototype.$clearCls = function() {
  var cls = this.sequelize.constructor.cls;
  if (cls) {
    if (cls.get('transaction') === this) {
      cls.set('transaction', null);
    }
  }
};
