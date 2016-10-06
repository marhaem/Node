/* */ 
'use strict';
Object.defineProperty(exports, "__esModule", {value: true});
exports.default = isInt;
var _assertString = require('./util/assertString');
var _assertString2 = _interopRequireDefault(_assertString);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
var int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
var intLeadingZeroes = /^[-+]?[0-9]+$/;
function isInt(str, options) {
  (0, _assertString2.default)(str);
  options = options || {};
  var regex = options.hasOwnProperty('allow_leading_zeroes') && options.allow_leading_zeroes ? intLeadingZeroes : int;
  var minCheckPassed = !options.hasOwnProperty('min') || str >= options.min;
  var maxCheckPassed = !options.hasOwnProperty('max') || str <= options.max;
  return regex.test(str) && minCheckPassed && maxCheckPassed;
}
module.exports = exports['default'];
