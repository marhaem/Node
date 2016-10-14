/* */ 
(function(process) {
  var common = require('./common');
  var _tempDir = require('./tempdir');
  var _pwd = require('./pwd');
  var path = require('path');
  var fs = require('fs');
  var child = require('child_process');
  var DEFAULT_MAXBUFFER_SIZE = 20 * 1024 * 1024;
  common.register('exec', _exec, {
    unix: false,
    canReceivePipe: true,
    wrapOutput: false
  });
  function execSync(cmd, opts, pipe) {
    var tempDir = _tempDir();
    var stdoutFile = path.resolve(tempDir + '/' + common.randomFileName());
    var stderrFile = path.resolve(tempDir + '/' + common.randomFileName());
    var codeFile = path.resolve(tempDir + '/' + common.randomFileName());
    var scriptFile = path.resolve(tempDir + '/' + common.randomFileName());
    var sleepFile = path.resolve(tempDir + '/' + common.randomFileName());
    opts = common.extend({
      silent: common.config.silent,
      cwd: _pwd().toString(),
      env: process.env,
      maxBuffer: DEFAULT_MAXBUFFER_SIZE
    }, opts);
    var previousStdoutContent = '';
    var previousStderrContent = '';
    function updateStream(streamFile) {
      if (opts.silent || !common.existsSync(streamFile)) {
        return;
      }
      var previousStreamContent;
      var procStream;
      if (streamFile === stdoutFile) {
        previousStreamContent = previousStdoutContent;
        procStream = process.stdout;
      } else {
        previousStreamContent = previousStderrContent;
        procStream = process.stderr;
      }
      var streamContent = fs.readFileSync(streamFile, 'utf8');
      if (streamContent.length <= previousStreamContent.length) {
        return;
      }
      procStream.write(streamContent.substr(previousStreamContent.length));
      previousStreamContent = streamContent;
    }
    if (common.existsSync(scriptFile))
      common.unlinkSync(scriptFile);
    if (common.existsSync(stdoutFile))
      common.unlinkSync(stdoutFile);
    if (common.existsSync(stderrFile))
      common.unlinkSync(stderrFile);
    if (common.existsSync(codeFile))
      common.unlinkSync(codeFile);
    var execCommand = JSON.stringify(process.execPath) + ' ' + JSON.stringify(scriptFile);
    var script;
    opts.cwd = path.resolve(opts.cwd);
    var optString = JSON.stringify(opts);
    if (typeof child.execSync === 'function') {
      script = ["var child = require('child_process')", "  , fs = require('fs');", 'var childProcess = child.exec(' + JSON.stringify(cmd) + ', ' + optString + ', function(err) {', '  fs.writeFileSync(' + JSON.stringify(codeFile) + ", err ? err.code.toString() : '0');", '});', 'var stdoutStream = fs.createWriteStream(' + JSON.stringify(stdoutFile) + ');', 'var stderrStream = fs.createWriteStream(' + JSON.stringify(stderrFile) + ');', 'childProcess.stdout.pipe(stdoutStream, {end: false});', 'childProcess.stderr.pipe(stderrStream, {end: false});', 'childProcess.stdout.pipe(process.stdout);', 'childProcess.stderr.pipe(process.stderr);'].join('\n') + (pipe ? '\nchildProcess.stdin.end(' + JSON.stringify(pipe) + ');\n' : '\n') + ['var stdoutEnded = false, stderrEnded = false;', 'function tryClosingStdout(){ if(stdoutEnded){ stdoutStream.end(); } }', 'function tryClosingStderr(){ if(stderrEnded){ stderrStream.end(); } }', "childProcess.stdout.on('end', function(){ stdoutEnded = true; tryClosingStdout(); });", "childProcess.stderr.on('end', function(){ stderrEnded = true; tryClosingStderr(); });"].join('\n');
      fs.writeFileSync(scriptFile, script);
      if (opts.silent) {
        opts.stdio = 'ignore';
      } else {
        opts.stdio = [0, 1, 2];
      }
      try {
        child.execSync(execCommand, opts);
      } catch (e) {
        try {
          common.unlinkSync(scriptFile);
        } catch (e2) {}
        try {
          common.unlinkSync(stdoutFile);
        } catch (e2) {}
        try {
          common.unlinkSync(stderrFile);
        } catch (e2) {}
        try {
          common.unlinkSync(codeFile);
        } catch (e2) {}
        throw e;
      }
    } else {
      cmd += ' > ' + stdoutFile + ' 2> ' + stderrFile;
      script = ["var child = require('child_process')", "  , fs = require('fs');", 'var childProcess = child.exec(' + JSON.stringify(cmd) + ', ' + optString + ', function(err) {', '  fs.writeFileSync(' + JSON.stringify(codeFile) + ", err ? err.code.toString() : '0');", '});'].join('\n') + (pipe ? '\nchildProcess.stdin.end(' + JSON.stringify(pipe) + ');\n' : '\n');
      fs.writeFileSync(scriptFile, script);
      child.exec(execCommand, opts);
      while (!common.existsSync(codeFile)) {
        updateStream(stdoutFile);
        fs.writeFileSync(sleepFile, 'a');
      }
      while (!common.existsSync(stdoutFile)) {
        updateStream(stdoutFile);
        fs.writeFileSync(sleepFile, 'a');
      }
      while (!common.existsSync(stderrFile)) {
        updateStream(stderrFile);
        fs.writeFileSync(sleepFile, 'a');
      }
      try {
        common.unlinkSync(sleepFile);
      } catch (e) {}
    }
    var code = parseInt('', 10);
    while (isNaN(code)) {
      code = parseInt(fs.readFileSync(codeFile, 'utf8'), 10);
    }
    var stdout = fs.readFileSync(stdoutFile, 'utf8');
    var stderr = fs.readFileSync(stderrFile, 'utf8');
    try {
      common.unlinkSync(scriptFile);
    } catch (e) {}
    try {
      common.unlinkSync(stdoutFile);
    } catch (e) {}
    try {
      common.unlinkSync(stderrFile);
    } catch (e) {}
    try {
      common.unlinkSync(codeFile);
    } catch (e) {}
    if (code !== 0) {
      common.error('', code, true);
    }
    var obj = common.ShellString(stdout, stderr, code);
    return obj;
  }
  function execAsync(cmd, opts, pipe, callback) {
    var stdout = '';
    var stderr = '';
    opts = common.extend({
      silent: common.config.silent,
      cwd: _pwd().toString(),
      env: process.env,
      maxBuffer: DEFAULT_MAXBUFFER_SIZE
    }, opts);
    var c = child.exec(cmd, opts, function(err) {
      if (callback) {
        callback(err ? err.code : 0, stdout, stderr);
      }
    });
    if (pipe)
      c.stdin.end(pipe);
    c.stdout.on('data', function(data) {
      stdout += data;
      if (!opts.silent)
        process.stdout.write(data);
    });
    c.stderr.on('data', function(data) {
      stderr += data;
      if (!opts.silent)
        process.stderr.write(data);
    });
    return c;
  }
  function _exec(command, options, callback) {
    options = options || {};
    if (!command)
      common.error('must specify command');
    var pipe = common.readFromPipe();
    if (typeof options === 'function') {
      callback = options;
      options = {async: true};
    }
    if (typeof options === 'object' && typeof callback === 'function') {
      options.async = true;
    }
    options = common.extend({
      silent: common.config.silent,
      async: false
    }, options);
    try {
      if (options.async) {
        return execAsync(command, options, pipe, callback);
      } else {
        return execSync(command, options, pipe);
      }
    } catch (e) {
      common.error('internal error');
    }
  }
  module.exports = _exec;
})(require('process'));
