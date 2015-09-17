/*global module */

(function () {
  'use strict';

  /**
   * Recover lost password via one of these methods:
   * - mail with _new_ temporary password is sent to user
   * - answers to previously set questions are provided
   *   - mail with _new_ temporary password is sent to the user
   */
  module.exports = {
    get: function get(credentialStore) {
      return [{
        method: 'POST',
        path: '/recover',
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