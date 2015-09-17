/*global module */

(function () {
  'use strict';

  /**
   * Apps have to request a token which is used for authorization and also expires.
   * Token is needed to access all other functionality.
   */
  module.exports = {
    get: function get(credentialStore) {
      return [{
        method: 'POST',
        path: '/client/token',
        config: {
          handler: function postHandler(request, reply) {
            //console.log('authed');
            reply('hello, ' + request.auth.credentials.name);
          }
        }
      }];
    }
  };
})();