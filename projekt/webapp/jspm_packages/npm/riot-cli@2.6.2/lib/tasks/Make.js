/* */ 
'use strict';
const Task = require('../Task'),
    helpers = require('../helpers'),
    chalk = require('chalk'),
    compiler = global.compiler || require('riot-compiler'),
    path = require('path'),
    sh = require('shelljs'),
    constants = require('../const'),
    START_FRAG = constants.MODULAR_START_FRAG,
    END_FRAG = constants.MODULAR_END_FRAG;
class Make extends Task {
  run(opt) {
    var isInputFile = opt.flow[0] == 'f',
        isOutputFile = opt.flow[1] == 'f',
        from = isInputFile ? [opt.from] : helpers.find(this.extRegex, opt.from),
        base = isInputFile ? path.dirname(opt.from) : opt.from,
        to = isOutputFile ? [opt.to] : helpers.remap(this.extRegex, from, opt.to, base, opt.export);
    var dirs = {};
    to.map((f) => dirs[path.dirname(f)] = 0);
    sh.mkdir('-p', Object.keys(dirs));
    if (opt.parsers)
      helpers.extend(compiler.parsers, opt.parsers);
    if (isOutputFile)
      this.toFile(from, to, opt);
    else
      this.toDir(from, to, opt);
    if (!opt.compiler.silent) {
      from.map((src, i) => {
        helpers.log(chalk.blue(helpers.toRelative(src)) + chalk.cyan(' -> ') + chalk.green(helpers.toRelative(to[i] || to[0])));
      });
    }
    return true;
  }
  toFile(from, to, opt) {
    this.encapsulate(from.map((path) => this.parse(path, opt)).join('\n'), opt).to(to[0]);
  }
  toDir(from, to, opt) {
    from.map((from, i) => {
      return this.encapsulate(this.parse(from, opt), opt).to(to[i]);
    });
  }
  parse(from, opt) {
    var out;
    try {
      out = compiler.compile(sh.cat(from).toString().replace(/^\uFEFF/g, ''), opt.compiler, from);
    } catch (e) {
      helpers.err(e);
    }
    if (opt.export)
      return out.reduce((prev, curr) => prev + curr[opt.export], '');
    else
      return out;
  }
  encapsulate(from, opt) {
    var out = !opt.compiler.modular ? from : `${START_FRAG}${from}${END_FRAG}`;
    return sh.ShellString(out);
  }
}
module.exports = Make;
