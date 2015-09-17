/*global module, require */

(function () {
  'use strict';

  module.exports.get = function get() {
    return []
      .concat(require('./v1/send').get());
  };
})();