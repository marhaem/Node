/* */ 
(function(Buffer) {
  var Writer = module.exports = function(size) {
    this.size = size || 1024;
    this.buffer = Buffer(this.size + 5);
    this.offset = 5;
    this.headerPosition = 0;
  };
  Writer.prototype._ensure = function(size) {
    var remaining = this.buffer.length - this.offset;
    if (remaining < size) {
      var oldBuffer = this.buffer;
      var newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
      this.buffer = new Buffer(newSize);
      oldBuffer.copy(this.buffer);
    }
  };
  Writer.prototype.addInt32 = function(num) {
    this._ensure(4);
    this.buffer[this.offset++] = (num >>> 24 & 0xFF);
    this.buffer[this.offset++] = (num >>> 16 & 0xFF);
    this.buffer[this.offset++] = (num >>> 8 & 0xFF);
    this.buffer[this.offset++] = (num >>> 0 & 0xFF);
    return this;
  };
  Writer.prototype.addInt16 = function(num) {
    this._ensure(2);
    this.buffer[this.offset++] = (num >>> 8 & 0xFF);
    this.buffer[this.offset++] = (num >>> 0 & 0xFF);
    return this;
  };
  var writeString = function(buffer, string, offset, len) {
    buffer.write(string, offset, len);
  };
  if (Buffer.prototype.write.length === 3) {
    writeString = function(buffer, string, offset, len) {
      buffer.write(string, offset);
    };
  }
  Writer.prototype.addCString = function(string) {
    if (!string) {
      this._ensure(1);
    } else {
      var len = Buffer.byteLength(string);
      this._ensure(len + 1);
      writeString(this.buffer, string, this.offset, len);
      this.offset += len;
    }
    this.buffer[this.offset++] = 0;
    return this;
  };
  Writer.prototype.addChar = function(c) {
    this._ensure(1);
    writeString(this.buffer, c, this.offset, 1);
    this.offset++;
    return this;
  };
  Writer.prototype.addString = function(string) {
    string = string || "";
    var len = Buffer.byteLength(string);
    this._ensure(len);
    this.buffer.write(string, this.offset);
    this.offset += len;
    return this;
  };
  Writer.prototype.getByteLength = function() {
    return this.offset - 5;
  };
  Writer.prototype.add = function(otherBuffer) {
    this._ensure(otherBuffer.length);
    otherBuffer.copy(this.buffer, this.offset);
    this.offset += otherBuffer.length;
    return this;
  };
  Writer.prototype.clear = function() {
    this.offset = 5;
    this.headerPosition = 0;
    this.lastEnd = 0;
  };
  Writer.prototype.addHeader = function(code, last) {
    var origOffset = this.offset;
    this.offset = this.headerPosition;
    this.buffer[this.offset++] = code;
    this.addInt32(origOffset - (this.headerPosition + 1));
    this.headerPosition = origOffset;
    this.offset = origOffset;
    if (!last) {
      this._ensure(5);
      this.offset += 5;
    }
  };
  Writer.prototype.join = function(code) {
    if (code) {
      this.addHeader(code, true);
    }
    return this.buffer.slice(code ? 0 : 5, this.offset);
  };
  Writer.prototype.flush = function(code) {
    var result = this.join(code);
    this.clear();
    return result;
  };
})(require('buffer').Buffer);
