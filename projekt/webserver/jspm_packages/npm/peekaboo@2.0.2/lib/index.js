/* */ 
'use strict';
const Stream = require('stream');
const Util = require('util');
const internals = {};
exports = module.exports = internals.Peek = function(emitter) {
  Stream.Transform.call(this);
  this._emmiter = emitter;
  this.once('finish', () => {
    emitter.emit('finish');
  });
};
Util.inherits(internals.Peek, Stream.Transform);
internals.Peek.prototype._transform = function(chunk, encoding, callback) {
  this._emmiter.emit('peek', chunk, encoding);
  this.push(chunk, encoding);
  callback();
};
