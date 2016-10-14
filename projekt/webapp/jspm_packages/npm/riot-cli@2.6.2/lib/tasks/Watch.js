/* */ 
(function(process) {
  'use strict';
  const Task = require('../Task'),
      Make = require('./Make'),
      chalk = require('chalk'),
      helpers = require('../helpers'),
      path = require('path'),
      cluster = require('cluster'),
      chokidar = require('chokidar');
  class Watch extends Task {
    run(opt) {
      if (cluster.isMaster && opt.isCli) {
        cluster.on('exit', () => cluster.fork({isFirstFork: false}));
        cluster.fork({isFirstFork: true});
      } else {
        var glob = opt.flow[0] == 'f' ? opt.from : path.join(opt.from, '**/*.' + opt.ext),
            isFirstFork = process.env.isFirstFork == 'true',
            watcher = chokidar.watch(glob, {ignoreInitial: !isFirstFork});
        watcher.on('ready', () => {
          helpers.log(chalk.cyan(isFirstFork ? `Watching: ${helpers.toRelative(glob)}` : `Process resumed! Watching: ${helpers.toRelative(glob)}`));
        }).on('all', () => new Make(opt));
        return watcher;
      }
    }
  }
  module.exports = Watch;
})(require('process'));
