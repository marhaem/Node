/* */ 
'use strict';
const Task = require('../Task'),
    analyzer = require('../analyzer/index'),
    sh = require('shelljs'),
    helpers = require('../helpers'),
    chalk = require('chalk'),
    log = helpers.log,
    find = helpers.find,
    toRelative = helpers.toRelative;
class Check extends Task {
  run(opt) {
    var from = opt.flow[0] == 'f' ? [opt.from] : find(this.extRegex, opt.from),
        results = from.map((file) => {
          var results = analyzer(sh.cat(file).toString().replace(/^\uFEFF/g, ''));
          return {
            file: toRelative(file),
            errors: results.filter((result) => result.error)
          };
        }).filter((results) => results.errors.length);
    if (results.length) {
      log(chalk.white.bgRed('Riot Tag Syntax Error'));
      results.forEach((check) => {
        check.errors.forEach((result) => {
          log(chalk.yellow(`${result.line} | `) + result.source);
          log(chalk.red(`^^^  ${result.error}`));
        });
        log(chalk.yellow(`Total error: ${check.errors.length} in "${check.file}"`));
      });
    } else
      log(chalk.green('No syntax error. Ready to compile :)'));
    return results;
  }
}
module.exports = Check;
