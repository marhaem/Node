/*global require, __dirname, module, console, process */



/**
 * Client token lifecycle:
 * 0. Share certificate between sso and 'client'.
 * 1. Send certificate signed request containing client name (required to store additonal data for users) to /token.
 * 2. Signature is verified.
 * 3. Get successful response and token with expiry timestamp.
 * 4. Token is renewed each time the Requestor makes a request.
 * 5. Token is expired, back to step 1.
 *
 * User lifecycle:
 * 1. User signs up and provides
 *    - username
 *    - password
 *    - secure questions/answers
 *    - other information such as name, address and so on
 * 2. Client has a valid token and sends token and data to /create.
 *    Data has to contain roles (even if it is just 'USER').
 *    Data may also contain additional data from the client.
 * 3. /create will respond with { error, userId }
 *    Error may be:
 *    - ENOTCREATED             there was an error and the user was not created
 *    - EALREADYEXISTS          primary key already exists (email address).
 *    - EPROVIDEPASSWORD        client has to provide the password due to some internal error (maybe the email service is down)
 *    - WMAILNOTSENTAUTORETRY   mail could not be sent for whatever reason and we will retry sending it (there will be a flag on the user)
 * 4. User receives a mail conataining
 *    - temporary password
 * 5. User logs into client with temporary password.
 * 6. Client requests /auth with its token and the temporary password.
 * 7. /auth responds with { error, basicUser }
 *    Error may be
 *    - EINVALID     user not found or password not correct
 *    - ELOCKED      locked
 *    - ESUSPENDED   suspended
 *    - ETEMPORARY   password was temporary, user needs to provide his own
 *    - EEXPIRED     password ks expired use /recover
 *    BasicUser contains
 *    - Roles
 * 8. User provides password
 * 9. Client sends his token, current and new password to /auth
 * 10. /auth responds
 * 11. Password expires /recover is called.
 * 12. /modify and so on may e called.
 * 13. /delete is the end.
 */

/**
 * Needed user information
 * - email
 * - password hash and salt
 * - creation date
 * - password expiry date
 * - password type user or temporary
 * - other information such as name, address and so on
 * - additional client data
 * - last login date
 * - times logged in
 * - locked
 * - suspended
 * - welcome mail was sent
 * - times
 */

(function () {
  'use strict';

  var isDevel = (process.env.NODE_ENV === 'development');
  console.log('Starting in ' + (isDevel ? '<development>' : 'productive') + ' mode');

  var TAGS = ['SingleSignOn', 'keepersguides.com'];

  var fs = require('fs');
  var hapi = require('hapi');

  var globals = require('./lib/globals');
  var credentialStore = require('./lib/CredentialStore').create();

// routes
  var hapiRoutes = []
    .concat(require('./routes/approve').get(credentialStore))
    .concat(require('./routes/auth').get(credentialStore))
    .concat(require('./routes/client').get(credentialStore))
    .concat(require('./routes/create').get(credentialStore))
    .concat(require('./routes/delete').get(credentialStore))
    .concat(require('./routes/get').get(credentialStore))
    .concat(require('./routes/mail').get(credentialStore))
    .concat(require('./routes/modify').get(credentialStore))
    .concat(require('./routes/pwd').get(credentialStore))
    .concat(require('./routes/recover').get(credentialStore));

// hapi plugins
  var good = require('good');
  var goodConsole = require('good-console');
  var goodPlugin = {
    register: good,
    options: {
      reporters: [{
        reporter: goodConsole,
        args: [{ log: '*', response: '*' }]
      }]
    }
  };
  var hapiAuthHawk = require('hapi-auth-hawk');
  var hapiPlugins = [goodPlugin, hapiAuthHawk];



  var testMail = require('./lib/TestMail');
  var db = require('./lib/sql/');



  /**
   * Prepares starting the server.
   * Does things like clenaing a left-over socket file and so on.
   */
  function prepareStart(serviceConfig, cb) {
    if (serviceConfig.port && serviceConfig.port.toString().indexOf('/') > -1) {
      fs.exists(serviceConfig.port, function existsCB(exists) {
        if (!exists) {
          cb();
        }
        else {
          fs.unlink(serviceConfig.port, function unlinkCB(error) {
            if (error) {
              cb(error);
            }
            else {
              cb();
            }
          });
        }
      });
    }
    else {
      cb();
    }
  }

  /**
   * App.
   */
  var App = module.exports = function App() {
    this.server = new hapi.Server({
      debug: { request: ['error', 'uncaught'] }
    });
  };

  /**
   * Starts the server.
   */
  App.prototype.start = function start(instanceId) {
    var server = this.server;
    var serviceConfig = globals.config.service;
    var sqlConfig = globals.config.sql;

    prepareStart(serviceConfig, function prepareStartCB(error) {
      if (error) {
        throw error;
      }
      else {
        server.connection({
          host: serviceConfig.host,
          port: serviceConfig.port,
          labels: [instanceId || 'idless instance'].concat(TAGS)
        });

        server.register(hapiPlugins, function registerCB(error) {
          if (error) {
            throw error;
          }
          else {
            server.auth.strategy('default', 'hawk', { getCredentialsFunc: credentialStore.getCredentials, hawk: {} });

            server.route(hapiRoutes);

            server.start(function startCB(error) {
              if (error) {
                throw error;
              }
              else {
                server.log('info', 'Server running at: ' + server.info.uri);
              }
            });
          }
        });
      }
    });
  };
})();