/* */ 
(function(Buffer, process) {
  'use strict';
  var COV = process.env.npm_lifecycle_event === 'coverage';
  var RND = Math.random();
  var USER = 'pgpass-test-some:user:'.concat(RND);
  var PASS = 'pgpass-test-some:pass:'.concat(RND);
  var TEST_QUERY = 'SELECT CURRENT_USER AS me';
  var path = require('path');
  var pgPass = require(path.join('..', '..', COV ? 'lib-cov' : 'lib'));
  var assert = require('assert');
  var spawn = require('child_process').spawn;
  var fs = require('fs');
  var esc = require('pg-escape');
  var tmp = require('tmp');
  tmp.setGracefulCleanup();
  describe('using same password file', function() {
    before(pre);
    after(delUser);
    var pg = require('pg');
    var pgNative = pg.native;
    var config = {
      user: USER,
      database: 'postgres'
    };
    it('the JS client can connect', function(done) {
      pg.connect(config, checkConnection.bind(null, done));
    });
    it('the native client can connect', function(done) {
      pgNative.connect(config, checkConnection.bind(null, done));
    });
    it('the psql client can connect', function(done) {
      runPsqlCmd(TEST_QUERY, function(err, res) {
        checkQueryRes(err, res.replace(/\n$/, ''));
        done();
      }, USER);
    });
  });
  function checkQueryRes(err, res) {
    assert.ifError(err);
    assert.strictEqual(USER, res);
  }
  function checkConnection(testDone, err, client, pgDone) {
    assert.ifError(err);
    client.query(TEST_QUERY, function(err, res) {
      checkQueryRes(err, res.rows[0].me);
      pgDone();
      testDone();
    });
  }
  function pre(cb) {
    genUser(function(err) {
      if (err) {
        delUser(function() {
          throw err;
        });
      } else {
        setupPassFile(cb);
      }
    });
  }
  function pgEsc(str) {
    return str.replace(/([:\\])/g, '\\$1');
  }
  function setupPassFile(cb) {
    tmp.file({mode: 384}, function(err, path, fd) {
      if (err) {
        return cb(err);
      }
      var str = '*:*:*:__USER__:__PASS__'.replace('__USER__', pgEsc(USER)).replace('__PASS__', pgEsc(PASS));
      ;
      var buf = new Buffer(str);
      fs.write(fd, buf, 0, buf.length, 0, function(err) {
        if (err) {
          return cb(err);
        }
        process.env.PGPASSFILE = path;
        cb();
      });
    });
  }
  function genUser(cb) {
    var cmd = esc('CREATE USER %I WITH PASSWORD %L', USER, PASS);
    runPsqlCmd(cmd, cb);
  }
  function delUser(cb) {
    var cmd = esc('DROP USER %I', USER);
    runPsqlCmd(cmd, cb);
  }
  function runPsqlCmd(cmd, cb, user) {
    var psql = spawn('psql', ['-A', '-t', '-h', '127.0.0.1', '-d', 'postgres', '-U', user || 'postgres', '-c', cmd]);
    var out = '';
    psql.stdout.on('data', function(data) {
      out += data.toString();
    });
    psql.on('exit', function(code) {
      cb(code === 0 ? null : code, out);
    });
    psql.stderr.on('data', function(err) {
      console.log('ERR:', err.toString());
    });
  }
})(require('buffer').Buffer, require('process'));
