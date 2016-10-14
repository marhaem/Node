/* */ 
'use strict';
const helpers = require('./helpers'),
    path = require('path'),
    sh = require('shelljs'),
    compiler = global.compiler || require('riot-compiler'),
    constants = require('./const'),
    NO_FILE_FOUND = constants.NO_FILE_FOUND,
    PREPROCESSOR_NOT_REGISTERED = constants.PREPROCESSOR_NOT_REGISTERED;
class Task {
  constructor(opt) {
    if (this.called)
      return;
    this.called = true;
    opt.parsers = helpers.extend(compiler.parsers, opt.parsers || {});
    this.error = opt.compiler ? this.validate(opt.compiler, opt.parsers) : null;
    this.extRegex = new RegExp(`\\.${opt.ext || 'tag'}$`);
    if (!opt.to)
      opt.to = this.extRegex.test(opt.from) ? path.dirname(opt.from) : opt.from;
    opt.from = path.resolve(opt.from);
    opt.to = path.resolve(opt.to);
    if (!sh.test('-e', opt.from))
      this.error = NO_FILE_FOUND;
    if (this.error) {
      if (opt.isCli)
        helpers.err(this.error);
      else
        return this.error;
    }
    opt.flow = (this.extRegex.test(opt.from) ? 'f' : 'd') + (/\.(js|html|css)$/.test(opt.to) ? 'f' : 'd');
    if (!opt.compiler)
      opt.compiler = {};
    return this.run(opt);
  }
  findParser(type, id, parsers) {
    var error;
    if (!compiler.parsers[type][id] && !parsers[type][id])
      error = PREPROCESSOR_NOT_REGISTERED(type, id);
    else
      try {
        compiler.parsers._req(id, true);
      } catch (e) {
        error = e.toString();
      }
    return typeof error == 'string' ? error : null;
  }
  validate(opt, parsers) {
    var template = opt.template,
        type = opt.type,
        style = opt.style,
        error = null;
    if (template)
      error = this.findParser('html', template, parsers);
    if (type && !error)
      error = this.findParser('js', type, parsers);
    if (style && !error)
      error = this.findParser('css', style, parsers);
    return error;
  }
}
module.exports = Task;
