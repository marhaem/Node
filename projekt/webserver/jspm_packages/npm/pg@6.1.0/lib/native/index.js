/* */ 
var Native = require('pg-native');
var TypeOverrides = require('../type-overrides');
var semver = require('semver');
var pkg = require('../../package.json!systemjs-json');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var ConnectionParameters = require('../connection-parameters');
var msg = 'Version >= ' + pkg.minNativeVersion + ' of pg-native required.';
assert(semver.gte(Native.version, pkg.minNativeVersion), msg);
var NativeQuery = require('./query');
var Client = module.exports = function(config) {
  EventEmitter.call(this);
  config = config || {};
  this._types = new TypeOverrides(config.types);
  this.native = new Native({types: this._types});
  this._queryQueue = [];
  this._connected = false;
  var cp = this.connectionParameters = new ConnectionParameters(config);
  this.user = cp.user;
  this.password = cp.password;
  this.database = cp.database;
  this.host = cp.host;
  this.port = cp.port;
  this.namedQueries = {};
};
util.inherits(Client, EventEmitter);
Client.prototype.connect = function(cb) {
  var self = this;
  var onError = function(err) {
    if (cb)
      return cb(err);
    return self.emit('error', err);
  };
  this.connectionParameters.getLibpqConnectionString(function(err, conString) {
    if (err)
      return onError(err);
    self.native.connect(conString, function(err) {
      if (err)
        return onError(err);
      self._connected = true;
      self.native.on('error', function(err) {
        if (self._activeQuery && self._activeQuery.state != 'end') {
          return;
        }
        self.emit('error', err);
      });
      self.native.on('notification', function(msg) {
        self.emit('notification', {
          channel: msg.relname,
          payload: msg.extra
        });
      });
      self.emit('connect');
      self._pulseQueryQueue(true);
      if (cb)
        cb();
    });
  });
};
Client.prototype.query = function(config, values, callback) {
  var query = new NativeQuery(this.native);
  if (typeof config == 'string') {
    query.text = config;
  }
  if (typeof config == 'object') {
    query.text = config.text;
    query.values = config.values;
    query.name = config.name;
    query.callback = config.callback;
    query._arrayMode = config.rowMode == 'array';
  }
  if (typeof values == 'function') {
    query.callback = values;
  } else if (util.isArray(values)) {
    query.values = values;
  }
  if (typeof callback == 'function') {
    query.callback = callback;
  }
  this._queryQueue.push(query);
  this._pulseQueryQueue();
  return query;
};
Client.prototype.end = function(cb) {
  var self = this;
  if (!this._connected) {
    this.once('connect', this.end.bind(this, cb));
  }
  this.native.end(function() {
    if (self._hasActiveQuery()) {
      var msg = 'Connection terminated';
      self._queryQueue.length = 0;
      self._activeQuery.handleError(new Error(msg));
    }
    self.emit('end');
    if (cb)
      cb();
  });
};
Client.prototype._hasActiveQuery = function() {
  return this._activeQuery && this._activeQuery.state != 'error' && this._activeQuery.state != 'end';
};
Client.prototype._pulseQueryQueue = function(initialConnection) {
  if (!this._connected) {
    return;
  }
  if (this._hasActiveQuery()) {
    return;
  }
  var query = this._queryQueue.shift();
  if (!query) {
    if (!initialConnection) {
      this.emit('drain');
    }
    return;
  }
  this._activeQuery = query;
  query.submit(this);
  var self = this;
  query.once('_done', function() {
    self._pulseQueryQueue();
  });
};
Client.prototype.cancel = function(query) {
  if (this._activeQuery == query) {
    this.native.cancel(function() {});
  } else if (this._queryQueue.indexOf(query) != -1) {
    this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
  }
};
Client.prototype.setTypeParser = function(oid, format, parseFn) {
  return this._types.setTypeParser(oid, format, parseFn);
};
Client.prototype.getTypeParser = function(oid, format) {
  return this._types.getTypeParser(oid, format);
};
