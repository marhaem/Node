/* */ 
(function(Buffer) {
  module.exports = LocalDataFilePacket;
  function LocalDataFilePacket(data) {
    this.data = data;
  }
  LocalDataFilePacket.prototype.write = function(writer) {
    writer.writeBuffer(this.data);
  };
})(require('buffer').Buffer);
