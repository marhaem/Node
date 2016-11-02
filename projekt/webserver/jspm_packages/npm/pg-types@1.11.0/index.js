/* */ 
var textParsers = require('./lib/textParsers');
var binaryParsers = require('./lib/binaryParsers');
var arrayParser = require('./lib/arrayParser');
exports.getTypeParser = getTypeParser;
exports.setTypeParser = setTypeParser;
exports.arrayParser = arrayParser;
var typeParsers = {
  text: {},
  binary: {}
};
function noParse(val) {
  return String(val);
}
;
function getTypeParser(oid, format) {
  format = format || 'text';
  if (!typeParsers[format]) {
    return noParse;
  }
  return typeParsers[format][oid] || noParse;
}
;
function setTypeParser(oid, format, parseFn) {
  if (typeof format == 'function') {
    parseFn = format;
    format = 'text';
  }
  typeParsers[format][oid] = parseFn;
}
;
textParsers.init(function(oid, converter) {
  typeParsers.text[oid] = converter;
});
binaryParsers.init(function(oid, converter) {
  typeParsers.binary[oid] = converter;
});
