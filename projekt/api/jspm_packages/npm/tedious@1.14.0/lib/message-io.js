/* */ 
(function(Buffer) {
  'use strict';
  var _get = require('babel-runtime/helpers/get')['default'];
  var _inherits = require('babel-runtime/helpers/inherits')['default'];
  var _createClass = require('babel-runtime/helpers/create-class')['default'];
  var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];
  var tls = require('tls');
  var crypto = require('crypto');
  var EventEmitter = require('events').EventEmitter;
  var Transform = require('readable-stream').Transform;
  require('./buffertools');
  var Packet = require('./packet').Packet;
  var TYPE = require('./packet').TYPE;
  var packetHeaderLength = require('./packet').HEADER_LENGTH;
  var ReadablePacketStream = (function(_Transform) {
    _inherits(ReadablePacketStream, _Transform);
    function ReadablePacketStream() {
      _classCallCheck(this, ReadablePacketStream);
      _get(Object.getPrototypeOf(ReadablePacketStream.prototype), 'constructor', this).call(this, {objectMode: true});
      this.buffer = new Buffer(0);
      this.position = 0;
    }
    _createClass(ReadablePacketStream, [{
      key: '_transform',
      value: function _transform(chunk, encoding, callback) {
        if (this.position === this.buffer.length) {
          this.buffer = chunk;
        } else {
          this.buffer = Buffer.concat([this.buffer.slice(this.position), chunk], this.buffer.length - this.position + chunk.length);
        }
        this.position = 0;
        while (this.buffer.length >= this.position + packetHeaderLength) {
          var _length = this.buffer.readUInt16BE(this.position + 2);
          if (this.buffer.length >= this.position + _length) {
            var data = this.buffer.slice(this.position, this.position + _length);
            this.position += _length;
            this.push(new Packet(data));
          } else {
            break;
          }
        }
        callback();
      }
    }]);
    return ReadablePacketStream;
  })(Transform);
  module.exports = (function(_EventEmitter) {
    _inherits(MessageIO, _EventEmitter);
    function MessageIO(socket, _packetSize, debug) {
      var _this = this;
      _classCallCheck(this, MessageIO);
      _get(Object.getPrototypeOf(MessageIO.prototype), 'constructor', this).call(this);
      this.socket = socket;
      this._packetSize = _packetSize;
      this.debug = debug;
      this.sendPacket = this.sendPacket.bind(this);
      this.packetStream = new ReadablePacketStream();
      this.packetStream.on('data', function(packet) {
        _this.logPacket('Received', packet);
        _this.emit('data', packet.data());
        if (packet.isLast()) {
          _this.emit('message');
        }
      });
      this.socket.pipe(this.packetStream);
      this.packetDataSize = this._packetSize - packetHeaderLength;
    }
    _createClass(MessageIO, [{
      key: 'packetSize',
      value: function packetSize(_packetSize2) {
        if (arguments.length > 0) {
          this.debug.log('Packet size changed from ' + this._packetSize + ' to ' + _packetSize2);
          this._packetSize = _packetSize2;
          this.packetDataSize = this._packetSize - packetHeaderLength;
        }
        return this._packetSize;
      }
    }, {
      key: 'startTls',
      value: function startTls(credentialsDetails) {
        var _this2 = this;
        var credentials = tls.createSecureContext ? tls.createSecureContext(credentialsDetails) : crypto.createCredentials(credentialsDetails);
        this.securePair = tls.createSecurePair(credentials);
        this.tlsNegotiationComplete = false;
        this.securePair.on('secure', function() {
          var cipher = _this2.securePair.cleartext.getCipher();
          _this2.debug.log('TLS negotiated (' + cipher.name + ', ' + cipher.version + ')');
          _this2.emit('secure', _this2.securePair.cleartext);
          _this2.encryptAllFutureTraffic();
        });
        this.securePair.encrypted.on('data', function(data) {
          _this2.sendMessage(TYPE.PRELOGIN, data);
        });
        this.securePair.cleartext.write('');
      }
    }, {
      key: 'encryptAllFutureTraffic',
      value: function encryptAllFutureTraffic() {
        this.socket.unpipe(this.packetStream);
        this.securePair.encrypted.removeAllListeners('data');
        this.socket.pipe(this.securePair.encrypted);
        this.securePair.encrypted.pipe(this.socket);
        this.securePair.cleartext.pipe(this.packetStream);
        this.tlsNegotiationComplete = true;
      }
    }, {
      key: 'tlsHandshakeData',
      value: function tlsHandshakeData(data) {
        this.securePair.encrypted.write(data);
      }
    }, {
      key: 'sendMessage',
      value: function sendMessage(packetType, data, resetConnection) {
        var numberOfPackets = undefined;
        if (data) {
          numberOfPackets = Math.floor((data.length - 1) / this.packetDataSize) + 1;
        } else {
          numberOfPackets = 1;
          data = new Buffer(0);
        }
        for (var packetNumber = 0; packetNumber < numberOfPackets; packetNumber++) {
          var payloadStart = packetNumber * this.packetDataSize;
          var payloadEnd = undefined;
          if (packetNumber < numberOfPackets - 1) {
            payloadEnd = payloadStart + this.packetDataSize;
          } else {
            payloadEnd = data.length;
          }
          var packetPayload = data.slice(payloadStart, payloadEnd);
          var packet = new Packet(packetType);
          packet.last(packetNumber === numberOfPackets - 1);
          packet.resetConnection(resetConnection);
          packet.packetId(packetNumber + 1);
          packet.addData(packetPayload);
          this.sendPacket(packet);
        }
      }
    }, {
      key: 'sendPacket',
      value: function sendPacket(packet) {
        this.logPacket('Sent', packet);
        if (this.securePair && this.tlsNegotiationComplete) {
          this.securePair.cleartext.write(packet.buffer);
        } else {
          this.socket.write(packet.buffer);
        }
      }
    }, {
      key: 'logPacket',
      value: function logPacket(direction, packet) {
        this.debug.packet(direction, packet);
        return this.debug.data(packet);
      }
    }]);
    return MessageIO;
  })(EventEmitter);
})(require('buffer').Buffer);
