/* */ 
var mixobj = require('./_utils').mixobj,
    parser = require('buble');
module.exports = function _buble(js, opts, url) {
  opts = mixobj({
    source: url,
    modules: false
  }, opts);
  return parser.transform(js, opts).code;
};
