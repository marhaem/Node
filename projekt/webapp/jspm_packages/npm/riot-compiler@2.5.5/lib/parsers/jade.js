/* */ 
var mixobj = require('./_utils').mixobj,
    parser = require('jade');
var defopts = {
  pretty: true,
  doctype: 'html'
};
console.log('DEPRECATION WARNING: jade was renamed "pug" - the jade parser will be removed in riot@3.0.0!');
module.exports = function _jade(html, opts, url) {
  opts = mixobj(defopts, {filename: url}, opts);
  return parser.render(html, opts);
};
