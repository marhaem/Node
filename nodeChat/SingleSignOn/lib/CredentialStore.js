/*global require, module, console */
/*jshint sub: true */

(function () {
  'use strict';

  /**
   *
   */
  var CredentialStore = module.exports = function CredentialStore() {
    //
  };

  /**
   * Returns a new CredentialStore object.
   */
  CredentialStore.create = function create() {
    var store = {};
    /*store['d74s3nz2873n'] = {
      getCredentials: {
        key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
        algorithm: 'sha256'
      }
      //, additional: 'data'
    };*/

    return {
      /**
       * Generates a new public key (id) and private key (key) pair and returns a credential object.
       * If an id is given it means that we want to renew all keys, this is good for removing clutter from the store.
       */
      generate: function generate(id, data, callback) {
        if (id) {
          delete store[id];
        }

        id = 'd74s3nz2873n';

        var client = {
          credentials: {
            key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
            algorithm: 'sha256'
          },
          data: data
        };

        store[id] = client;
        callback(null, { id: id, key: client.credentials.key, algorithm: client.credentials.algorithm });
      },
      /**
       * Returns the whole client object.
       */
      get: function get(id, callback) {
        var client = store[id];
        if (client) {
          return callback(null, client);
        }
        else {
          return callback();
        }
      },
      /**
       * Returns the auth part.
       */
      getCredentials: function getCredentials(id, callback) {
        console.log('CredentialStore.getAuth() { id: `' + id + '` }');
        var client = store[id];
        if (client) {
          return callback(null, client.credentials);
        }
        else {
          return callback(null, store[id]);
        }
      }
    };
  };
})();