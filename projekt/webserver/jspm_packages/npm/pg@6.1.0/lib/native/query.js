/* */ 
(function(process) {
  var EventEmitter = require('events').EventEmitter;
  var util = require('util');
  var utils = require('../utils');
  var NativeResult = require('./result');
  var NativeQuery = module.exports = function(native) {
    EventEmitter.call(this);
    this.native = native;
    this.text = null;
    this.values = null;
    this.name = null;
    this.callback = null;
    this.state = 'new';
    this._arrayMode = false;
    this._emitRowEvents = false;
    this.on('newListener', function(event) {
      if (event === 'row')
        this._emitRowEvents = true;
    }.bind(this));
  };
  util.inherits(NativeQuery, EventEmitter);
  NativeQuery.prototype.then = function(onSuccess, onFailure) {
    return this.promise().then(onSuccess, onFailure);
  };
  NativeQuery.prototype.catch = function(callback) {
    return this.promise().catch(callback);
  };
  NativeQuery.prototype.promise = function() {
    if (this._promise)
      return this._promise;
    this._promise = new Promise(function(resolve, reject) {
      this.once('end', resolve);
      this.once('error', reject);
    }.bind(this));
    return this._promise;
  };
  NativeQuery.prototype.handleError = function(err) {
    var self = this;
    var fields = self.native.pq.resultErrorFields();
    if (fields) {
      for (var key in fields) {
        err[key] = fields[key];
      }
    }
    if (self.callback) {
      self.callback(err);
    } else {
      self.emit('error', err);
    }
    self.state = 'error';
  };
  NativeQuery.prototype.submit = function(client) {
    this.state = 'running';
    var self = this;
    client.native.arrayMode = this._arrayMode;
    var after = function(err, rows) {
      client.native.arrayMode = false;
      setImmediate(function() {
        self.emit('_done');
      });
      if (err) {
        return self.handleError(err);
      }
      var result = new NativeResult();
      result.addCommandComplete(self.native.pq);
      result.rows = rows;
      if (self._emitRowEvents) {
        rows.forEach(function(row) {
          self.emit('row', row, result);
        });
      }
      self.state = 'end';
      self.emit('end', result);
      if (self.callback) {
        self.callback(null, result);
      }
    };
    if (process.domain) {
      after = process.domain.bind(after);
    }
    if (this.name) {
      if (this.name.length > 63) {
        console.error('Warning! Postgres only supports 63 characters for query names.');
        console.error('You supplied', this.name, '(', this.name.length, ')');
        console.error('This can cause conflicts and silent errors executing queries');
      }
      var values = (this.values || []).map(utils.prepareValue);
      if (client.namedQueries[this.name]) {
        return this.native.execute(this.name, values, after);
      }
      return this.native.prepare(this.name, this.text, values.length, function(err) {
        if (err)
          return after(err);
        client.namedQueries[self.name] = true;
        return self.native.execute(self.name, values, after);
      });
    } else if (this.values) {
      var vals = this.values.map(utils.prepareValue);
      this.native.query(this.text, vals, after);
    } else {
      this.native.query(this.text, after);
    }
  };
})(require('process'));
