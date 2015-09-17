/*global module */

(function () {
  'use strict';

  /**
   * Modify an existing user, able to
   * - change roles
   * - lock/unlock the account
   * - suspend the account
   * - change all information (even email address)
   */
  module.exports = {
    get: function get(credentialStore) {
      return [{
        method: 'POST',
        path: '/modify',
        handler: function postHandler(request, reply) {
          //
        }
      }];
    }
  };
})();