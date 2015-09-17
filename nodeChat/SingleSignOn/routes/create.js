/*global module */

(function () {
  'use strict';

  /**
   * Create a new user.
   * Unique constraints will be checked.
   * A new password will be generetated and sent to the user via mail.
   * User will be stored in the database.
   */
  module.exports = {
    get: function get(credentialStore) {
      return [{
        method: 'POST',
        path: '/create',
        handler: function postHandler(request, reply) {
          //
        }
      }];
    }
  };
})();