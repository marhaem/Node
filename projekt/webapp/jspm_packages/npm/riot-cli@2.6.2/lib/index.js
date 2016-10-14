/* */ 
(function(process) {
  'use strict';
  const Check = require('./tasks/Check'),
      New = require('./tasks/New'),
      Make = require('./tasks/Make'),
      Watch = require('./tasks/Watch'),
      helpers = require('./helpers'),
      options = require('./options'),
      path = require('path'),
      chalk = require('chalk'),
      co = require('co'),
      optionator = require('optionator')(options),
      API = {
        help() {
          var h = optionator.generateHelp();
          helpers.log(h);
          return h;
        },
        version() {
          var v = helpers.getVersion();
          helpers.log(v);
          return v;
        },
        new(opt) {
          return new New(opt);
        },
        check(opt) {
          return new Check(opt);
        },
        make(opt) {
          return new Make(opt);
        },
        watch(opt) {
          return new Watch(opt);
        },
        _cli: cli
      };
  function cli(ar) {
    var args;
    try {
      args = optionator.parse(ar ? ['node', path.resolve('lib')].concat(ar) : process.argv, options);
    } catch (e) {
      helpers.err(e);
      return e;
    }
    return co(function*() {
      if (args.config)
        return yield helpers.loadConfigFile(args.config);
      else
        return {};
    }).then(function(opt) {
      helpers.extend(args, opt);
      opt = {
        compiler: {
          compact: args.compact,
          template: args.template,
          style: args.style,
          type: args.type,
          brackets: args.brackets,
          entities: !!args.export,
          exclude: args.exclude,
          expr: args.expr,
          modular: args.modular,
          silent: args.silent,
          whitespace: args.whitespace
        },
        ext: args.ext,
        css: args.css,
        new: args.new,
        export: args.export,
        colors: args.colors,
        parsers: args.parsers,
        from: args.from || args._.shift(),
        to: args.to || args._.shift()
      };
      var method = Object.keys(API).filter((v) => args[v])[0] || (opt.from ? 'make' : 'help');
      chalk.constructor({enabled: !!opt.colors});
      global.isSilent = args.silent;
      opt.isCli = true;
      return API[method](opt);
    }).catch((e) => helpers.err(e));
  }
  if (module.parent) {
    module.exports = API;
    global.isSilent = true;
  } else
    cli();
})(require('process'));
