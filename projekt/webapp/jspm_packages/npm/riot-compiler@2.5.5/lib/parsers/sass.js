/* */ 
var mixobj = require('./_utils').mixobj,
    getdir = require('path').dirname,
    parser = require('node-sass');
var defopts = {
  indentedSyntax: true,
  omitSourceMapUrl: true,
  outputStyle: 'compact'
};
module.exports = function _sass(tag, css, opts, url) {
  var spc = css.match(/^\s+/);
  if (spc) {
    css = css.replace(RegExp('^' + spc[0], 'gm'), '');
    if (/^\t/gm.test(css)) {
      opts.indentType = 'tab';
    }
  }
  opts = mixobj(defopts, {
    data: css,
    includePaths: [getdir(url)]
  }, opts);
  return parser.renderSync(opts).css + '';
};
