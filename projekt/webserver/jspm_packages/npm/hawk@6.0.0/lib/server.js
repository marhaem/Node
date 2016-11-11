/* */ 
(function(process) {
  'use strict';
  const Boom = require('boom');
  const Hoek = require('hoek');
  const Cryptiles = require('cryptiles');
  const Crypto = require('./crypto');
  const Utils = require('./utils');
  const internals = {};
  exports.authenticate = function(req, credentialsFunc, options, callback) {
    callback = Hoek.nextTick(callback);
    options.nonceFunc = options.nonceFunc || internals.nonceFunc;
    options.timestampSkewSec = options.timestampSkewSec || 60;
    const now = Utils.now(options.localtimeOffsetMsec);
    const request = Utils.parseRequest(req, options);
    if (request instanceof Error) {
      return callback(Boom.badRequest(request.message));
    }
    const attributes = Utils.parseAuthorizationHeader(request.authorization);
    if (attributes instanceof Error) {
      return callback(attributes);
    }
    const artifacts = {
      method: request.method,
      host: request.host,
      port: request.port,
      resource: request.url,
      ts: attributes.ts,
      nonce: attributes.nonce,
      hash: attributes.hash,
      ext: attributes.ext,
      app: attributes.app,
      dlg: attributes.dlg,
      mac: attributes.mac,
      id: attributes.id
    };
    if (!attributes.id || !attributes.ts || !attributes.nonce || !attributes.mac) {
      return callback(Boom.badRequest('Missing attributes'), null, artifacts);
    }
    credentialsFunc(attributes.id, (err, credentials) => {
      if (err) {
        return callback(err, credentials || null, artifacts);
      }
      if (!credentials) {
        return callback(Utils.unauthorized('Unknown credentials'), null, artifacts);
      }
      if (!credentials.key || !credentials.algorithm) {
        return callback(Boom.internal('Invalid credentials'), credentials, artifacts);
      }
      if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
        return callback(Boom.internal('Unknown algorithm'), credentials, artifacts);
      }
      const mac = Crypto.calculateMac('header', credentials, artifacts);
      if (!Cryptiles.fixedTimeComparison(mac, attributes.mac)) {
        return callback(Utils.unauthorized('Bad mac'), credentials, artifacts);
      }
      if (options.payload || options.payload === '') {
        if (!attributes.hash) {
          return callback(Utils.unauthorized('Missing required payload hash'), credentials, artifacts);
        }
        const hash = Crypto.calculatePayloadHash(options.payload, credentials.algorithm, request.contentType);
        if (!Cryptiles.fixedTimeComparison(hash, attributes.hash)) {
          return callback(Utils.unauthorized('Bad payload hash'), credentials, artifacts);
        }
      }
      options.nonceFunc(credentials.key, attributes.nonce, attributes.ts, (err) => {
        if (err) {
          return callback(Utils.unauthorized('Invalid nonce'), credentials, artifacts);
        }
        if (Math.abs((attributes.ts * 1000) - now) > (options.timestampSkewSec * 1000)) {
          const tsm = Crypto.timestampMessage(credentials, options.localtimeOffsetMsec);
          return callback(Utils.unauthorized('Stale timestamp', tsm), credentials, artifacts);
        }
        return callback(null, credentials, artifacts);
      });
    });
  };
  exports.authenticatePayload = function(payload, credentials, artifacts, contentType) {
    const calculatedHash = Crypto.calculatePayloadHash(payload, credentials.algorithm, contentType);
    return Cryptiles.fixedTimeComparison(calculatedHash, artifacts.hash);
  };
  exports.authenticatePayloadHash = function(calculatedHash, artifacts) {
    return Cryptiles.fixedTimeComparison(calculatedHash, artifacts.hash);
  };
  exports.header = function(credentials, artifacts, options) {
    options = options || {};
    if (!artifacts || typeof artifacts !== 'object' || typeof options !== 'object') {
      return '';
    }
    artifacts = Hoek.clone(artifacts);
    delete artifacts.mac;
    artifacts.hash = options.hash;
    artifacts.ext = options.ext;
    if (!credentials || !credentials.key || !credentials.algorithm) {
      return '';
    }
    if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
      return '';
    }
    if (!artifacts.hash && (options.payload || options.payload === '')) {
      artifacts.hash = Crypto.calculatePayloadHash(options.payload, credentials.algorithm, options.contentType);
    }
    const mac = Crypto.calculateMac('response', credentials, artifacts);
    let header = 'Hawk mac="' + mac + '"' + (artifacts.hash ? ', hash="' + artifacts.hash + '"' : '');
    if (artifacts.ext !== null && artifacts.ext !== undefined && artifacts.ext !== '') {
      header = header + ', ext="' + Hoek.escapeHeaderAttribute(artifacts.ext) + '"';
    }
    return header;
  };
  internals.bewitRegex = /^(\/.*)([\?&])bewit\=([^&$]*)(?:&(.+))?$/;
  exports.authenticateBewit = function(req, credentialsFunc, options, callback) {
    callback = Hoek.nextTick(callback);
    const now = Utils.now(options.localtimeOffsetMsec);
    const request = Utils.parseRequest(req, options);
    if (request instanceof Error) {
      return callback(Boom.badRequest(request.message));
    }
    if (request.url.length > Utils.limits.maxMatchLength) {
      return callback(Boom.badRequest('Resource path exceeds max length'));
    }
    const resource = request.url.match(internals.bewitRegex);
    if (!resource) {
      return callback(Utils.unauthorized());
    }
    if (!resource[3]) {
      return callback(Utils.unauthorized('Empty bewit'));
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return callback(Utils.unauthorized('Invalid method'));
    }
    if (request.authorization) {
      return callback(Boom.badRequest('Multiple authentications'));
    }
    const bewitString = Hoek.base64urlDecode(resource[3]);
    if (bewitString instanceof Error) {
      return callback(Boom.badRequest('Invalid bewit encoding'));
    }
    const bewitParts = bewitString.split('\\');
    if (bewitParts.length !== 4) {
      return callback(Boom.badRequest('Invalid bewit structure'));
    }
    const bewit = {
      id: bewitParts[0],
      exp: parseInt(bewitParts[1], 10),
      mac: bewitParts[2],
      ext: bewitParts[3] || ''
    };
    if (!bewit.id || !bewit.exp || !bewit.mac) {
      return callback(Boom.badRequest('Missing bewit attributes'));
    }
    let url = resource[1];
    if (resource[4]) {
      url = url + resource[2] + resource[4];
    }
    if (bewit.exp * 1000 <= now) {
      return callback(Utils.unauthorized('Access expired'), null, bewit);
    }
    credentialsFunc(bewit.id, (err, credentials) => {
      if (err) {
        return callback(err, credentials || null, bewit.ext);
      }
      if (!credentials) {
        return callback(Utils.unauthorized('Unknown credentials'), null, bewit);
      }
      if (!credentials.key || !credentials.algorithm) {
        return callback(Boom.internal('Invalid credentials'), credentials, bewit);
      }
      if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
        return callback(Boom.internal('Unknown algorithm'), credentials, bewit);
      }
      const mac = Crypto.calculateMac('bewit', credentials, {
        ts: bewit.exp,
        nonce: '',
        method: 'GET',
        resource: url,
        host: request.host,
        port: request.port,
        ext: bewit.ext
      });
      if (!Cryptiles.fixedTimeComparison(mac, bewit.mac)) {
        return callback(Utils.unauthorized('Bad mac'), credentials, bewit);
      }
      return callback(null, credentials, bewit);
    });
  };
  exports.authenticateMessage = function(host, port, message, authorization, credentialsFunc, options, callback) {
    callback = Hoek.nextTick(callback);
    options.nonceFunc = options.nonceFunc || internals.nonceFunc;
    options.timestampSkewSec = options.timestampSkewSec || 60;
    const now = Utils.now(options.localtimeOffsetMsec);
    if (!authorization.id || !authorization.ts || !authorization.nonce || !authorization.hash || !authorization.mac) {
      return callback(Boom.badRequest('Invalid authorization'));
    }
    credentialsFunc(authorization.id, (err, credentials) => {
      if (err) {
        return callback(err, credentials || null);
      }
      if (!credentials) {
        return callback(Utils.unauthorized('Unknown credentials'));
      }
      if (!credentials.key || !credentials.algorithm) {
        return callback(Boom.internal('Invalid credentials'), credentials);
      }
      if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
        return callback(Boom.internal('Unknown algorithm'), credentials);
      }
      const artifacts = {
        ts: authorization.ts,
        nonce: authorization.nonce,
        host,
        port,
        hash: authorization.hash
      };
      const mac = Crypto.calculateMac('message', credentials, artifacts);
      if (!Cryptiles.fixedTimeComparison(mac, authorization.mac)) {
        return callback(Utils.unauthorized('Bad mac'), credentials);
      }
      const hash = Crypto.calculatePayloadHash(message, credentials.algorithm);
      if (!Cryptiles.fixedTimeComparison(hash, authorization.hash)) {
        return callback(Utils.unauthorized('Bad message hash'), credentials);
      }
      options.nonceFunc(credentials.key, authorization.nonce, authorization.ts, (err) => {
        if (err) {
          return callback(Utils.unauthorized('Invalid nonce'), credentials);
        }
        if (Math.abs((authorization.ts * 1000) - now) > (options.timestampSkewSec * 1000)) {
          return callback(Utils.unauthorized('Stale timestamp'), credentials);
        }
        return callback(null, credentials);
      });
    });
  };
  internals.nonceFunc = function(key, nonce, ts, nonceCallback) {
    return nonceCallback();
  };
})(require('process'));
