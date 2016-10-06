/* */ 
(function(Buffer) {
  'use strict';
  var _get = require('babel-runtime/helpers/get')['default'];
  var _inherits = require('babel-runtime/helpers/inherits')['default'];
  var _createClass = require('babel-runtime/helpers/create-class')['default'];
  var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];
  var EventEmitter = require('events').EventEmitter;
  var StreamParser = require('./stream-parser');
  var Parser = (function(_EventEmitter) {
    _inherits(Parser, _EventEmitter);
    function Parser(debug, colMetadata, options) {
      var _this = this;
      _classCallCheck(this, Parser);
      _get(Object.getPrototypeOf(Parser.prototype), 'constructor', this).call(this);
      this.debug = debug;
      this.colMetadata = this.colMetadata;
      this.options = options;
      this.parser = new StreamParser(this.debug, this.colMetadata, this.options);
      this.parser.on('data', function(token) {
        if (token.event) {
          _this.emit(token.event, token);
        }
      });
    }
    _createClass(Parser, [{
      key: 'addBuffer',
      value: function addBuffer(buffer) {
        return this.parser.write(buffer);
      }
    }, {
      key: 'isEnd',
      value: function isEnd() {
        return this.parser.buffer.length === this.parser.position;
      }
    }]);
    return Parser;
  })(EventEmitter);
  module.exports.Parser = Parser;
})(require('buffer').Buffer);
