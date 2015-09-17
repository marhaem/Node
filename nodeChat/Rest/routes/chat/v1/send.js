/*global module */

(function () {
  'use strict';

  module.exports.get = function get() {
    return [{
      method: ['PUT', 'POST'],
      path: '/chat/v1/send',
      handler: function(request, reply) {
        return reply;
      }
    }];
  };
})();