/* */ 
(function(process) {
  'use strict';
  const TEMP_FILE_NAME = require('./const').TEMP_FILE_NAME,
      path = require('path'),
      rollup = require('rollup'),
      chalk = require('chalk'),
      sh = require('shelljs');
  module.exports = {
    find(extRegex, from) {
      return sh.find(from).filter((f) => extRegex.test(f) && TEMP_FILE_NAME.test(f));
    },
    remap(extRegex, from, to, base, extension) {
      return from.map((from) => path.join(to, path.relative(base, from).replace(extRegex, `.${extension || 'js'}`)));
    },
    toRelative(path) {
      return path.replace(sh.pwd().toString() + '/', '');
    },
    extend(src) {
      var obj,
          args = arguments;
      for (var i = 1; i < args.length; ++i) {
        if (obj = args[i]) {
          for (var key in obj) {
            if (typeof obj[key] === 'object' && typeof src[key] === 'object')
              src[key] = this.extend(src[key], obj[key]);
            else if (typeof obj[key] !== 'undefined')
              src[key] = obj[key];
          }
        }
      }
      return src;
    },
    loadConfigFile(src) {
      src = path.resolve(src);
      if (src.slice(-3) !== '.js')
        src += '.js';
      return rollup.rollup({
        entry: src,
        onwarn: this.log
      }).then((bundle) => {
        var opts,
            code = bundle.generate({format: 'cjs'}).code,
            jsLoader = require.extensions['.js'];
        require.extensions['.js'] = function(m, filename) {
          if (filename === src)
            m._compile(code, filename);
          else
            jsLoader(m, filename);
        };
        try {
          opts = require(src);
        } catch (err) {
          this.err(err);
        }
        require.extensions['.js'] = jsLoader;
        return opts;
      }).catch((err) => {
        this.log('It was not possible to load your config file, are you sure the path is correct?');
        this.err(err);
      });
    },
    log(msg) {
      if (!global.isSilent)
        console.log(msg);
    },
    err(msg) {
      msg += '\n';
      if (!global.isSilent)
        process.stderr.write(chalk.red(msg)) || process.exit(1);
      else
        throw msg;
    },
    getVersion() {
      return `
  riot-cli:      ${require('../package.json!systemjs-json').version} - https://github.com/riot/cli
  riot-compiler: ${require('riot-compiler/package.json!systemjs-json').version} - https://github.com/riot/compiler
`;
    }
  };
})(require('process'));
