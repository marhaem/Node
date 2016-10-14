/* */ 
(function(process) {
  'use strict';
  var safeRegex = require('./safe-regex');
  var R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g;
  var R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g;
  var S_QBLOCKS = R_STRINGS.source + '|' + /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' + /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source;
  var FINDBRACES = {
    '(': RegExp('([()])|' + S_QBLOCKS, 'g'),
    '[': RegExp('([[\\]])|' + S_QBLOCKS, 'g'),
    '{': RegExp('([{}])|' + S_QBLOCKS, 'g')
  };
  var DEFAULT = '{ }';
  var _pairs = ['{', '}', '{', '}', /{[^}]*}/, /\\([{}])/g, /\\({)|{/g, RegExp('\\\\(})|([[({])|(})|' + S_QBLOCKS, 'g'), DEFAULT];
  var _cache = [];
  function _rewrite(re) {
    return RegExp(re.source.replace(/{/g, _cache[2]).replace(/}/g, _cache[3]), re.global ? 'g' : '');
  }
  module.exports = {
    R_STRINGS: R_STRINGS,
    R_MLCOMMS: R_MLCOMMS,
    S_QBLOCKS: S_QBLOCKS
  };
  module.exports.split = function split(str, _, _bp) {
    var parts = [],
        match,
        isexpr,
        start,
        pos,
        re = _bp[6];
    isexpr = start = re.lastIndex = 0;
    while ((match = re.exec(str))) {
      pos = match.index;
      if (isexpr) {
        if (match[2]) {
          re.lastIndex = skipBraces(str, match[2], re.lastIndex);
          continue;
        }
        if (!match[3]) {
          continue;
        }
      }
      if (!match[1]) {
        unescapeStr(str.slice(start, pos));
        start = re.lastIndex;
        re = _bp[6 + (isexpr ^= 1)];
        re.lastIndex = start;
      }
    }
    if (str && start < str.length) {
      unescapeStr(str.slice(start));
    }
    return parts;
    function unescapeStr(s) {
      if (isexpr) {
        parts.push(s && s.replace(_bp[5], '$1'));
      } else {
        parts.push(s);
      }
    }
    function skipBraces(s, ch, ix) {
      var mm,
          rr = FINDBRACES[ch];
      rr.lastIndex = ix;
      ix = 1;
      while ((mm = rr.exec(s))) {
        if (mm[1] && !(mm[1] === ch ? ++ix : --ix))
          break;
      }
      if (ix) {
        throw new Error('Unbalanced brackets in ...`' + s.slice(start) + '`?');
      }
      return rr.lastIndex;
    }
  };
  var INVALIDCH = safeRegex(/[@-@<>a-zA-Z0-9'",;\\]/, 'x00', 'x1F');
  var ESCAPEDCH = /(?=[[\]()*+?.^$|])/g;
  module.exports.array = function array(pair) {
    if (!pair || pair === DEFAULT)
      return _pairs;
    if (_cache[8] !== pair) {
      _cache = pair.split(' ');
      if (_cache.length !== 2 || INVALIDCH.test(pair)) {
        throw new Error('Unsupported brackets "' + pair + '"');
      }
      _cache = _cache.concat(pair.replace(ESCAPEDCH, '\\').split(' '));
      _cache[4] = _rewrite(_cache[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4]);
      _cache[5] = _rewrite(/\\({|})/g);
      _cache[6] = _rewrite(_pairs[6]);
      _cache[7] = RegExp('\\\\(' + _cache[3] + ')|([[({])|(' + _cache[3] + ')|' + S_QBLOCKS, 'g');
      _cache[8] = pair;
    }
    return _cache;
  };
})(require('process'));
