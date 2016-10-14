/* */ 
var mixobj = require('./_utils').mixobj,
    parser = require('less');
var defopts = {
  sync: true,
  syncImport: true,
  compress: true
};
module.exports = function _less(tag, css, opts, url) {
  var ret;
  opts = mixobj(defopts, {filename: url}, opts);
  parser.render(css, opts, function(err, result) {
    if (err)
      throw err;
    ret = result.css;
  });
  return ret;
};
