/* */ 
var mixobj = require('./_utils').mixobj,
    tryreq = require('./_utils').tryreq,
    parser = require('stylus');
var nib = tryreq('nib');
module.exports = nib ? function _stylus(tag, css, opts, url) {
  opts = mixobj({filename: url}, opts);
  return parser(css, opts).use(nib()).import('nib').render();
} : function _stylus(tag, css, opts, url) {
  opts = mixobj({filename: url}, opts);
  return parser.render(css, opts);
};
