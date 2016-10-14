/* */ 
var mixobj = require('./_utils').mixobj,
    tryreq = require('./_utils').tryreq;
var parser = tryreq('babel') || require('babel-core');
var defopts = {
  blacklist: ['useStrict', 'strict', 'react'],
  sourceMaps: false,
  comments: false
};
module.exports = function _es6(js, opts) {
  opts = mixobj(defopts, opts);
  return parser.transform(js, opts).code;
};
