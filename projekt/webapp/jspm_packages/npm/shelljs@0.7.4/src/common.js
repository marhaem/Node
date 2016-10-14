/* */ 
(function(process) {
  'use strict';
  var os = require('os');
  var fs = require('fs');
  var glob = require('glob');
  var shell = require('../shell');
  var DEFAULT_ERROR_CODE = 1;
  var shellMethods = Object.create(shell);
  var config = {
    silent: false,
    fatal: false,
    verbose: false,
    noglob: false,
    globOptions: {},
    maxdepth: 255
  };
  exports.config = config;
  var state = {
    error: null,
    errorCode: 0,
    currentCmd: 'shell.js',
    tempDir: null
  };
  exports.state = state;
  delete process.env.OLDPWD;
  var platform = os.type().match(/^Win/) ? 'win' : 'unix';
  exports.platform = platform;
  var pipeMethods = [];
  function log() {
    if (!config.silent) {
      console.error.apply(console, arguments);
    }
  }
  exports.log = log;
  function error(msg, _code, _continue) {
    if (typeof _code === 'boolean') {
      _continue = _code;
      _code = DEFAULT_ERROR_CODE;
    }
    if (typeof _code !== 'number') {
      _code = DEFAULT_ERROR_CODE;
    }
    if (state.errorCode === 0) {
      state.errorCode = _code;
    }
    if (state.error === null) {
      state.error = '';
    }
    var logEntry = state.currentCmd + ': ' + msg;
    if (state.error === '') {
      state.error = logEntry;
    } else {
      state.error += '\n' + logEntry;
    }
    if (config.fatal)
      throw new Error(logEntry);
    if (msg.length > 0)
      log(logEntry);
    if (!_continue) {
      throw {
        msg: 'earlyExit',
        retValue: (new ShellString('', state.error, state.errorCode))
      };
    }
  }
  exports.error = error;
  function existsSync(file) {
    try {
      fs.statSync(file);
      return true;
    } catch (e) {
      return false;
    }
  }
  exports.existsSync = existsSync;
  function ShellString(stdout, stderr, code) {
    var that;
    if (stdout instanceof Array) {
      that = stdout;
      that.stdout = stdout.join('\n');
      if (stdout.length > 0)
        that.stdout += '\n';
    } else {
      that = new String(stdout);
      that.stdout = stdout;
    }
    that.stderr = stderr;
    that.code = code;
    pipeMethods.forEach(function(cmd) {
      that[cmd] = shellMethods[cmd].bind(that);
    });
    return that;
  }
  exports.ShellString = ShellString;
  function getUserHome() {
    var result;
    if (os.homedir) {
      result = os.homedir();
    } else {
      result = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    }
    return result;
  }
  exports.getUserHome = getUserHome;
  function parseOptions(opt, map) {
    if (!map)
      error('parseOptions() internal error: no map given');
    var options = {};
    Object.keys(map).forEach(function(letter) {
      if (map[letter][0] !== '!') {
        options[map[letter]] = false;
      }
    });
    if (!opt)
      return options;
    var optionName;
    if (typeof opt === 'string') {
      if (opt[0] !== '-') {
        return options;
      }
      var chars = opt.slice(1).split('');
      chars.forEach(function(c) {
        if (c in map) {
          optionName = map[c];
          if (optionName[0] === '!') {
            options[optionName.slice(1)] = false;
          } else {
            options[optionName] = true;
          }
        } else {
          error('option not recognized: ' + c);
        }
      });
    } else if (typeof opt === 'object') {
      Object.keys(opt).forEach(function(key) {
        var c = key[1];
        if (c in map) {
          optionName = map[c];
          options[optionName] = opt[key];
        } else {
          error('option not recognized: ' + c);
        }
      });
    } else {
      error('options must be strings or key-value pairs');
    }
    return options;
  }
  exports.parseOptions = parseOptions;
  function expand(list) {
    if (!Array.isArray(list)) {
      throw new TypeError('must be an array');
    }
    var expanded = [];
    list.forEach(function(listEl) {
      if (typeof listEl !== 'string') {
        expanded.push(listEl);
      } else {
        var ret = glob.sync(listEl, config.globOptions);
        expanded = expanded.concat(ret.length > 0 ? ret : [listEl]);
      }
    });
    return expanded;
  }
  exports.expand = expand;
  function unlinkSync(file) {
    try {
      fs.unlinkSync(file);
    } catch (e) {
      if (e.code === 'EPERM') {
        fs.chmodSync(file, '0666');
        fs.unlinkSync(file);
      } else {
        throw e;
      }
    }
  }
  exports.unlinkSync = unlinkSync;
  function randomFileName() {
    function randomHash(count) {
      if (count === 1) {
        return parseInt(16 * Math.random(), 10).toString(16);
      }
      var hash = '';
      for (var i = 0; i < count; i++) {
        hash += randomHash(1);
      }
      return hash;
    }
    return 'shelljs_' + randomHash(20);
  }
  exports.randomFileName = randomFileName;
  function objectAssign(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
      Object.keys(source).forEach(function(key) {
        target[key] = source[key];
      });
    });
    return target;
  }
  exports.extend = Object.assign || objectAssign;
  function wrap(cmd, fn, options) {
    options = options || {};
    if (options.canReceivePipe) {
      pipeMethods.push(cmd);
    }
    return function() {
      var retValue = null;
      state.currentCmd = cmd;
      state.error = null;
      state.errorCode = 0;
      try {
        var args = [].slice.call(arguments, 0);
        if (config.verbose) {
          console.error.apply(console, [cmd].concat(args));
        }
        state.pipedValue = (this && typeof this.stdout === 'string') ? this.stdout : '';
        if (options.unix === false) {
          retValue = fn.apply(this, args);
        } else {
          if (args[0] instanceof Object && args[0].constructor.name === 'Object') {} else if (args.length === 0 || typeof args[0] !== 'string' || args[0].length <= 1 || args[0][0] !== '-') {
            args.unshift('');
          }
          args = args.reduce(function(accum, cur) {
            if (Array.isArray(cur)) {
              return accum.concat(cur);
            }
            accum.push(cur);
            return accum;
          }, []);
          args = args.map(function(arg) {
            if (arg instanceof Object && arg.constructor.name === 'String') {
              return arg.toString();
            }
            return arg;
          });
          var homeDir = getUserHome();
          args = args.map(function(arg) {
            if (typeof arg === 'string' && arg.slice(0, 2) === '~/' || arg === '~') {
              return arg.replace(/^~/, homeDir);
            }
            return arg;
          });
          if (!config.noglob && options.allowGlobbing === true) {
            args = args.slice(0, options.globStart).concat(expand(args.slice(options.globStart)));
          }
          try {
            if (typeof options.cmdOptions === 'object') {
              args[0] = parseOptions(args[0], options.cmdOptions);
            }
            retValue = fn.apply(this, args);
          } catch (e) {
            if (e.msg === 'earlyExit') {
              retValue = e.retValue;
            } else {
              throw e;
            }
          }
        }
      } catch (e) {
        if (!state.error) {
          console.error('ShellJS: internal error');
          console.error(e.stack || e);
          process.exit(1);
        }
        if (config.fatal)
          throw e;
      }
      if (options.wrapOutput && (typeof retValue === 'string' || Array.isArray(retValue))) {
        retValue = new ShellString(retValue, state.error, state.errorCode);
      }
      state.currentCmd = 'shell.js';
      return retValue;
    };
  }
  exports.wrap = wrap;
  function _readFromPipe() {
    return state.pipedValue;
  }
  exports.readFromPipe = _readFromPipe;
  var DEFAULT_WRAP_OPTIONS = {
    allowGlobbing: true,
    canReceivePipe: false,
    cmdOptions: false,
    globStart: 1,
    pipeOnly: false,
    unix: true,
    wrapOutput: true,
    overWrite: false
  };
  function _register(name, implementation, wrapOptions) {
    wrapOptions = wrapOptions || {};
    wrapOptions = objectAssign({}, DEFAULT_WRAP_OPTIONS, wrapOptions);
    if (shell[name] && !wrapOptions.overWrite) {
      throw new Error('unable to overwrite `' + name + '` command');
    }
    if (wrapOptions.pipeOnly) {
      wrapOptions.canReceivePipe = true;
      shellMethods[name] = wrap(name, implementation, wrapOptions);
    } else {
      shell[name] = wrap(name, implementation, wrapOptions);
    }
  }
  exports.register = _register;
})(require('process'));
