/*global module */

(function () {
  'use strict';

  /**
   * Returns all data for a user.
   */
  module.exports = {
    get: function get(credentialStore) {
      return [{
        method: 'POST',
        path: '/get',
        handler: function postHandler(request, reply) {
          //
        }
      }];
    }
  };
})();