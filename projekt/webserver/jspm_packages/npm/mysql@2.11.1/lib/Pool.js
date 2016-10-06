/* */ 
(function(process) {
  var mysql = require('../index');
  var Connection = require('./Connection');
  var EventEmitter = require('events').EventEmitter;
  var Util = require('util');
  var PoolConnection = require('./PoolConnection');
  module.exports = Pool;
  Util.inherits(Pool, EventEmitter);
  function Pool(options) {
    EventEmitter.call(this);
    this.config = options.config;
    this.config.connectionConfig.pool = this;
    this._acquiringConnections = [];
    this._allConnections = [];
    this._freeConnections = [];
    this._connectionQueue = [];
    this._closed = false;
  }
  Pool.prototype.getConnection = function(cb) {
    if (this._closed) {
      var err = new Error('Pool is closed.');
      err.code = 'POOL_CLOSED';
      process.nextTick(function() {
        cb(err);
      });
      return;
    }
    var connection;
    var pool = this;
    if (this._freeConnections.length > 0) {
      connection = this._freeConnections.shift();
      this.acquireConnection(connection, cb);
      return;
    }
    if (this.config.connectionLimit === 0 || this._allConnections.length < this.config.connectionLimit) {
      connection = new PoolConnection(this, {config: this.config.newConnectionConfig()});
      this._acquiringConnections.push(connection);
      this._allConnections.push(connection);
      connection.connect({timeout: this.config.acquireTimeout}, function onConnect(err) {
        spliceConnection(pool._acquiringConnections, connection);
        if (pool._closed) {
          err = new Error('Pool is closed.');
          err.code = 'POOL_CLOSED';
        }
        if (err) {
          pool._purgeConnection(connection);
          cb(err);
          return;
        }
        pool.emit('connection', connection);
        cb(null, connection);
      });
      return;
    }
    if (!this.config.waitForConnections) {
      process.nextTick(function() {
        var err = new Error('No connections available.');
        err.code = 'POOL_CONNLIMIT';
        cb(err);
      });
      return;
    }
    this._enqueueCallback(cb);
  };
  Pool.prototype.acquireConnection = function acquireConnection(connection, cb) {
    if (connection._pool !== this) {
      throw new Error('Connection acquired from wrong pool.');
    }
    var changeUser = this._needsChangeUser(connection);
    var pool = this;
    this._acquiringConnections.push(connection);
    function onOperationComplete(err) {
      spliceConnection(pool._acquiringConnections, connection);
      if (pool._closed) {
        err = new Error('Pool is closed.');
        err.code = 'POOL_CLOSED';
      }
      if (err) {
        pool._connectionQueue.unshift(cb);
        pool._purgeConnection(connection);
        return;
      }
      if (changeUser) {
        pool.emit('connection', connection);
      }
      cb(null, connection);
    }
    if (changeUser) {
      connection.config = this.config.newConnectionConfig();
      connection.changeUser({timeout: this.config.acquireTimeout}, onOperationComplete);
    } else {
      connection.ping({timeout: this.config.acquireTimeout}, onOperationComplete);
    }
  };
  Pool.prototype.releaseConnection = function releaseConnection(connection) {
    var pool = this;
    if (this._acquiringConnections.indexOf(connection) !== -1) {
      return;
    }
    if (connection._pool) {
      if (connection._pool !== this) {
        throw new Error('Connection released to wrong pool');
      }
      if (this._freeConnections.indexOf(connection) !== -1) {
        throw new Error('Connection already released');
      } else {
        this._freeConnections.push(connection);
      }
    }
    if (this._closed) {
      this._connectionQueue.splice(0).forEach(function(cb) {
        var err = new Error('Pool is closed.');
        err.code = 'POOL_CLOSED';
        process.nextTick(function() {
          cb(err);
        });
      });
    } else if (this._connectionQueue.length) {
      this.getConnection(this._connectionQueue.shift());
    }
  };
  Pool.prototype.end = function(cb) {
    this._closed = true;
    if (typeof cb != "function") {
      cb = function(err) {
        if (err)
          throw err;
      };
    }
    var calledBack = false;
    var waitingClose = 0;
    function onEnd(err) {
      if (!calledBack && (err || --waitingClose <= 0)) {
        calledBack = true;
        cb(err);
      }
    }
    while (this._allConnections.length !== 0) {
      waitingClose++;
      this._purgeConnection(this._allConnections[0], onEnd);
    }
    if (waitingClose === 0) {
      process.nextTick(onEnd);
    }
  };
  Pool.prototype.query = function(sql, values, cb) {
    var query = Connection.createQuery(sql, values, cb);
    if (!(typeof sql === 'object' && 'typeCast' in sql)) {
      query.typeCast = this.config.connectionConfig.typeCast;
    }
    if (this.config.connectionConfig.trace) {
      query._callSite = new Error;
    }
    this.getConnection(function(err, conn) {
      if (err) {
        query.on('error', function() {});
        query.end(err);
        return;
      }
      query.once('end', function() {
        conn.release();
      });
      conn.query(query);
    });
    return query;
  };
  Pool.prototype._enqueueCallback = function _enqueueCallback(callback) {
    if (this.config.queueLimit && this._connectionQueue.length >= this.config.queueLimit) {
      process.nextTick(function() {
        var err = new Error('Queue limit reached.');
        err.code = 'POOL_ENQUEUELIMIT';
        callback(err);
      });
      return;
    }
    var cb = process.domain ? process.domain.bind(callback) : callback;
    this._connectionQueue.push(cb);
    this.emit('enqueue');
  };
  Pool.prototype._needsChangeUser = function _needsChangeUser(connection) {
    var connConfig = connection.config;
    var poolConfig = this.config.connectionConfig;
    return connConfig.user !== poolConfig.user || connConfig.database !== poolConfig.database || connConfig.password !== poolConfig.password || connConfig.charsetNumber !== poolConfig.charsetNumber;
  };
  Pool.prototype._purgeConnection = function _purgeConnection(connection, callback) {
    var cb = callback || function() {};
    if (connection.state === 'disconnected') {
      connection.destroy();
    }
    this._removeConnection(connection);
    if (connection.state !== 'disconnected' && !connection._protocol._quitSequence) {
      connection._realEnd(cb);
      return;
    }
    process.nextTick(cb);
  };
  Pool.prototype._removeConnection = function(connection) {
    connection._pool = null;
    spliceConnection(this._allConnections, connection);
    spliceConnection(this._freeConnections, connection);
    this.releaseConnection(connection);
  };
  Pool.prototype.escape = function(value) {
    return mysql.escape(value, this.config.connectionConfig.stringifyObjects, this.config.connectionConfig.timezone);
  };
  Pool.prototype.escapeId = function escapeId(value) {
    return mysql.escapeId(value, false);
  };
  function spliceConnection(array, connection) {
    var index;
    if ((index = array.indexOf(connection)) !== -1) {
      array.splice(index, 1);
    }
  }
})(require('process'));
