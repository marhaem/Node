/*global require, module, console */

(function () {
  'use strict';

  var Bcrypt = require('bcrypt');
  var Hawk = require('hawk');

  var url = {
    protocol: 'http',
    hostname: 'keepers',
    port: 8080,
    pathname: '/login',
    search: ''
  };

  var users = {
    john: {
      username: 'john',
      password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
      name: 'John Doe',
      id: '2133d32a'
    }
  };

  /**
   *
   */
  function getUser(username, password, callback) {
    var user = users[username];
    if (!user) {
      return callback(null, false);
    }
    else {
      Bcrypt.compare(password, user.password, function (error, isValid) {
        callback(error, isValid, { id: user.id, name: user.name });
      });
    }
  }

  function hawkHeader(credentialStore, id, path) {
    var credentials = credentialStore[id];
    if (credentials) {
      return Hawk.client.header('http://example.com:8080' + path, 'POST', { credentials: credentials });
    }
    else {
      return '';
    }
  }

  /**
   * Authenticates a user by validating the provided username / password combination.
   * Accounts with expired passwords have to obtain a new temporary password or set a new password.
   * Accounts with a temporary password have to set their own real password first.
   * Locked / suspended accounts will not be authorized.
   * The account has to be assigned to the provided context(s) the user wants to authorize for.
   * Token generation and so on will be handled by the app that sent the request here.
   */
  module.exports = {
    get: function get(credentialStore) {
      return [{
        method: 'POST',
        path: '/auth',
        handler: function postHandler(request, reply) {
          getUser(request.payload.username, request.payload.password, function getUserCallback(error, isValid, user) {
            if (error) {
              return reply.view('error', {
                title: 'Wrong login',
                message: 'Nice try...'
              });
            }
            else {
              // generate new credentials for the client
              credentialStore.generate(null, user, function (error, credentials) {
                if (error) {
                  console.error(error);
                }
                else {
                  var options = {
                    payload: JSON.stringify(credentials),
                    contentType: 'application/json'
                  };

                  // create auhorization header
                  var authorizationHeader = Hawk.client.header(url, 'POST', { credentials: credentials });
                  console.log(authorizationHeader || 'authorizationHeader is null');

                  var serverAuthorizationHeader = Hawk.server.header(credentials, authorizationHeader.artifacts, options);
                  console.log(serverAuthorizationHeader || 'serverAuthorizationHeader is null');

                  reply(options.payload)
                    .type(options.contentType)
                    .header('Server-Authorization', serverAuthorizationHeader);
                }
              });
            }
          });
        }
      }];
    }
  };
})();