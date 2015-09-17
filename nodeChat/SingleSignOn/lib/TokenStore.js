/*global require, module */

(function () {
  'use strict';

  var moment = require('moment');
  var cacheMysql = require('cache-mysql');

  /*
  token is generated on login
    - has a timestamp DATE
      - diff between now and (timestamp + global ttl) = validity
    - is stored
      - in local cache (array)
      - in mysql
      - Generate mysql cache class???

  on every request that has a token
    - update timestamp in cache
      - cache should lazily wait and only write to db either along with logins or every 3 minutes or so
  */
  module.exports.createStore = function createStore(config) {
    if (!config) {
      throw new Error('config is required');
    }
    else {
      // @todo use joi here to make sure values are in save ranges
      if (!config.name) {
        throw new Error('config.name is required');
      }
      else {
        config.maxRetries = Number(config.maxRetries || 8);
        config.secondsToLive = Number(config.secondsToLive || 300);
        config.syncWithTokenGeneration = config.syncWithTokenGeneration || true;
        config.lazySyncIntervalSeconds = config.lazySyncIntervalSeconds || Math.round(config.secondsToLive / 2);

        var store = {};

        // return new TokenStore instance.
        return {
          /**
           * Generates a new and unique token.
           */
          generate: function generate() {
            var token = 'genertated';

            // make sure its unique
            if (store.hasOwnProperty(token)) {
              var retriesLeft = config.maxRetries;
              while ((retriesLeft -= 1) >= 0) {
                token = 'newly generated';
                if (!store.hasOwnProperty(token)) {
                  break;
                }
              }
            }

            store[token] = {
              timestamp: Date.now(),
              valid: true
            };

            return token;
          },

          /**
           * Updates the timestamp of the token.
           */
          touch: function touch(token) {
            var tokenObject = store[token];
            if (tokenObject) {
              tokenObject.timestamp = Date.now();
            }
          },

          /**
           * Checks if the token is known and if (timestamp + secondsToLive) > now.
           * Also resets the expiry timestamp if the token is valid.
           */
          isValid: function isValid(token) {
            var tokenObject = store[token];
            if (tokenObject && tokenObject.valid) {
              if (moment().subtract(config.secondsToLive, 's').isBefore(tokenObject.timestamp)) {
                tokenObject.timestamp = Date.now();
                return true;
              }
              else {
                return (tokenObject.valid = false);
              }
            }
            else {
              return false;
            }
          }
        };
      }
    }
  };
})();