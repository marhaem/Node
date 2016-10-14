/* */ 
var mixobj = require('./_utils').mixobj,
    parser = require('babel-core');
module.exports = function _babel(js, opts, url) {
  opts = mixobj({filename: url}, opts);
  return parser.transform(js, opts).code;
};
