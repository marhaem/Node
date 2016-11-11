/* */ 
'use strict';
const Hoek = require('hoek');
const Hawk = require('hawk');
const Ticket = require('./ticket');
const internals = {};
exports.authenticate = function(req, encryptionPassword, options, callback) {
  return exports._authenticate(req, encryptionPassword, true, options, callback);
};
exports._authenticate = function(req, encryptionPassword, checkExpiration, options, callback) {
  Hoek.assert(encryptionPassword, 'Invalid encryption password');
  Hoek.assert(options, 'Invalid options object');
  const credentialsFunc = function(id, credsCallback) {
    Ticket.parse(id, encryptionPassword, options.ticket || {}, (err, ticket) => {
      if (err) {
        return credsCallback(err);
      }
      if (checkExpiration && ticket.exp <= Hawk.utils.now()) {
        const error = Hawk.utils.unauthorized('Expired ticket');
        error.output.payload.expired = true;
        return credsCallback(error);
      }
      return credsCallback(null, ticket);
    });
  };
  Hawk.server.authenticate(req, credentialsFunc, options.hawk || {}, (err, credentials, artifacts) => {
    if (err) {
      return callback(err);
    }
    if (credentials.app !== artifacts.app) {
      return callback(Hawk.utils.unauthorized('Mismatching application id'));
    }
    if ((credentials.dlg || artifacts.dlg) && credentials.dlg !== artifacts.dlg) {
      return callback(Hawk.utils.unauthorized('Mismatching delegated application id'));
    }
    return callback(null, credentials, artifacts);
  });
};
