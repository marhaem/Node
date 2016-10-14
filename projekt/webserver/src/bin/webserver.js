/*jshint -W034*/
/*global require, global console, process*/

(function (){
  'use strict';

  let bunyan = require('bunyan');
  let crypto = require('crypto');
  let logger = bunyan.createLogger({
    name: 'webserver',
    streams: [
      {
        level: 'info',
        stream: process.stdout
      },
      {
        level: 'error',
        path: './webserver-error.log'
      }
    ]
  });

  let System = require('jspm').Loader();

  let reject = function reject(err) {
    if (err) {
      logger.error(err);
    }
  };

  System.import('./src/lib/WebServer/Global.js').then((global) => {
    global = global.default;
    global.logger = logger;
    global.crypto = crypto;

    System.import('./src/lib/WebServer/Sequelize/index.js').then( (sequelize) => {
      sequelize = sequelize.default;
      console.log(sequelize());/*.authenticate().then( () => {
        console.log('seqeulize OK');
      }, reject).catch(reject);*/

      //console.log(sequelize);
    /*System.import('./src/lib/WebServer/Sql.js').then((Sql) => {
      Sql = Sql.default;
      global.Sequelize = Sequelize;
      global.sql = new Sql(Sequelize);

      global.sql.connect().then((result) => { // {force: true}
        logger.info('successfully connected to database: ' + result);
      }, reject); // sequelize.sync();
      global.models = global.sql.initModels();

      global.Sql = new Sql(Sequelize);
      let models = global.Sql.initModels();  // get models from database via sequelize.define();

      // test
      global.Sql.connect({ force: true }) // connect via sequelize.sync
      .then(() => {
        models.User.register({
          "email": "freakazoid@disney.com",
          "firstName": "Freak",
          "lastName": "Zoid",
          "passwordHash": "abc",
          "passwordSalt": "salt"
        })
        //.then((result) => {logger.info('User registered: ' + result);}, reject)
        .catch(reject);*/
    }, reject).catch(reject);

    System.import('./src/index.js').then((index) => {
      index = index.default;

      index.start();
    }, reject).catch(reject);
  }, reject).catch(reject);
//}, reject).catch(reject);
})();
//closure
