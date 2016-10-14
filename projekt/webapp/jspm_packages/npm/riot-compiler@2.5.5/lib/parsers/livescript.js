/* */ 
var mixobj = require('./_utils').mixobj,
    parser = require('livescript');
var defopts = {
  bare: true,
  header: false
};
module.exports = function _livescript(js, opts) {
  return parser.compile(js, mixobj(defopts, opts));
};
