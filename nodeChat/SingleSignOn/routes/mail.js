/*global module */

(function () {
  'use strict';

  /**
   * Able to send these mails to a user:
   * - welcome mail
   *
   * Note: Temporary password mails are handled by /recover
   */
  module.exports = {
    get: function get(credentialStore) {
      return [{
        method: 'POST',
        path: '/mail',
        handler: function postHandler(request, reply) {
          //
        }
      }];
    }
  };
})();