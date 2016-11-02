/* */ 
(function(process) {
  var EventEmitter = require('events').EventEmitter;
  var util = require('util');
  var Result = require('./result');
  var utils = require('./utils');
  var Query = function(config, values, callback) {
    if (!(this instanceof Query)) {
      return new Query(config, values, callback);
    }
    config = utils.normalizeQueryConfig(config, values, callback);
    this.text = config.text;
    this.values = config.values;
    this.rows = config.rows;
    this.types = config.types;
    this.name = config.name;
    this.binary = config.binary;
    this.stream = config.stream;
    this.portal = config.portal || "";
    this.callback = config.callback;
    if (process.domain && config.callback) {
      this.callback = process.domain.bind(config.callback);
    }
    this._result = new Result(config.rowMode, config.types);
    this.isPreparedStatement = false;
    this._canceledDueToError = false;
    this._promise = null;
    EventEmitter.call(this);
  };
  util.inherits(Query, EventEmitter);
  Query.prototype.then = function(onSuccess, onFailure) {
    return this.promise().then(onSuccess, onFailure);
  };
  Query.prototype.catch = function(callback) {
    return this.promise().catch(callback);
  };
  Query.prototype.promise = function() {
    if (this._promise)
      return this._promise;
    this._promise = new Promise(function(resolve, reject) {
      this.once('end', resolve);
      this.once('error', reject);
    }.bind(this));
    return this._promise;
  };
  Query.prototype.requiresPreparation = function() {
    if (this.name) {
      return true;
    }
    if (this.rows) {
      return true;
    }
    if (!this.text) {
      return false;
    }
    if (this.binary && !this.values) {
      return false;
    }
    return (this.values || 0).length > 0;
  };
  Query.prototype.handleRowDescription = function(msg) {
    this._result.addFields(msg.fields);
    this._accumulateRows = this.callback || !this.listeners('row').length;
  };
  Query.prototype.handleDataRow = function(msg) {
    var row = this._result.parseRow(msg.fields);
    this.emit('row', row, this._result);
    if (this._accumulateRows) {
      this._result.addRow(row);
    }
  };
  Query.prototype.handleCommandComplete = function(msg, con) {
    this._result.addCommandComplete(msg);
    if (this.isPreparedStatement) {
      con.sync();
    }
  };
  Query.prototype.handleEmptyQuery = function(con) {
    if (this.isPreparedStatement) {
      con.sync();
    }
  };
  Query.prototype.handleReadyForQuery = function() {
    if (this._canceledDueToError) {
      return this.handleError(this._canceledDueToError);
    }
    if (this.callback) {
      this.callback(null, this._result);
    }
    this.emit('end', this._result);
  };
  Query.prototype.handleError = function(err, connection) {
    if (this.isPreparedStatement) {
      connection.sync();
    }
    if (this._canceledDueToError) {
      err = this._canceledDueToError;
      this._canceledDueToError = false;
    }
    if (this.callback) {
      return this.callback(err);
    }
    this.emit('error', err);
  };
  Query.prototype.submit = function(connection) {
    if (this.requiresPreparation()) {
      this.prepare(connection);
    } else {
      connection.query(this.text);
    }
  };
  Query.prototype.hasBeenParsed = function(connection) {
    return this.name && connection.parsedStatements[this.name];
  };
  Query.prototype.handlePortalSuspended = function(connection) {
    this._getRows(connection, this.rows);
  };
  Query.prototype._getRows = function(connection, rows) {
    connection.execute({
      portal: this.portalName,
      rows: rows
    }, true);
    connection.flush();
  };
  Query.prototype.prepare = function(connection) {
    var self = this;
    this.isPreparedStatement = true;
    if (!this.hasBeenParsed(connection)) {
      connection.parse({
        text: self.text,
        name: self.name,
        types: self.types
      }, true);
    }
    if (self.values) {
      self.values = self.values.map(utils.prepareValue);
    }
    connection.bind({
      portal: self.portalName,
      statement: self.name,
      values: self.values,
      binary: self.binary
    }, true);
    connection.describe({
      type: 'P',
      name: self.portalName || ""
    }, true);
    this._getRows(connection, this.rows);
  };
  Query.prototype.handleCopyInResponse = function(connection) {
    if (this.stream)
      this.stream.startStreamingToConnection(connection);
    else
      connection.sendCopyFail('No source stream defined');
  };
  Query.prototype.handleCopyData = function(msg, connection) {
    var chunk = msg.chunk;
    if (this.stream) {
      this.stream.handleChunk(chunk);
    }
  };
  module.exports = Query;
})(require('process'));
