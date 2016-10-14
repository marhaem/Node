/* */ 
var mixobj = require('./_utils').mixobj,
    parser = require('coffee-script');
var defopts = {bare: true};
module.exports = function _coffee(js, opts) {
  return parser.compile(js, mixobj(defopts, opts));
};
