/*global module */

(function () {
  'use strict';

  /**
   * Deletes a user.
   */
  module.exports = {
    get: function get(credentialStore) {
      return [{
        method: 'POST',
        path: '/delete',
        config: {
          auth: { mode: 'required', strategy: 'default' },
          handler: function postHandler(request, reply) {
            //console.log('authed');
            reply('hello, ' + request.auth.credentials.name);
          }
        }
      }];
    }
  };
})();