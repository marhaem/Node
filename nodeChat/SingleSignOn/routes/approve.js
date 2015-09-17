/*global module */

(function () {
  'use strict';

  /**
   * 
   */
  module.exports = {
    get: function get(credentialStore) {
      return [{
        method: 'POST',
        path: '/approve',
        handler: function postHandler(request, reply) {
          //
        }
      }];
    }
  };
})();