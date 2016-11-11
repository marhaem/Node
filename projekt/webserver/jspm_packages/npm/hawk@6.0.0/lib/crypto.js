/* */ 
'use strict';
const Crypto = require('crypto');
const Url = require('url');
const Utils = require('./utils');
const internals = {};
exports.headerVersion = '1';
exports.algorithms = ['sha1', 'sha256'];
exports.calculateMac = function(type, credentials, options) {
  const normalized = exports.generateNormalizedString(type, options);
  const hmac = Crypto.createHmac(credentials.algorithm, credentials.key).update(normalized);
  const digest = hmac.digest('base64');
  return digest;
};
exports.generateNormalizedString = function(type, options) {
  let resource = options.resource || '';
  if (resource && resource[0] !== '/') {
    const url = Url.parse(resource, false);
    resource = url.path;
  }
  let normalized = 'hawk.' + exports.headerVersion + '.' + type + '\n' + options.ts + '\n' + options.nonce + '\n' + (options.method || '').toUpperCase() + '\n' + resource + '\n' + options.host.toLowerCase() + '\n' + options.port + '\n' + (options.hash || '') + '\n';
  if (options.ext) {
    normalized = normalized + options.ext.replace('\\', '\\\\').replace('\n', '\\n');
  }
  normalized = normalized + '\n';
  if (options.app) {
    normalized = normalized + options.app + '\n' + (options.dlg || '') + '\n';
  }
  return normalized;
};
exports.calculatePayloadHash = function(payload, algorithm, contentType) {
  const hash = exports.initializePayloadHash(algorithm, contentType);
  hash.update(payload || '');
  return exports.finalizePayloadHash(hash);
};
exports.initializePayloadHash = function(algorithm, contentType) {
  const hash = Crypto.createHash(algorithm);
  hash.update('hawk.' + exports.headerVersion + '.payload\n');
  hash.update(Utils.parseContentType(contentType) + '\n');
  return hash;
};
exports.finalizePayloadHash = function(hash) {
  hash.update('\n');
  return hash.digest('base64');
};
exports.calculateTsMac = function(ts, credentials) {
  const hmac = Crypto.createHmac(credentials.algorithm, credentials.key);
  hmac.update('hawk.' + exports.headerVersion + '.ts\n' + ts + '\n');
  return hmac.digest('base64');
};
exports.timestampMessage = function(credentials, localtimeOffsetMsec) {
  const now = Utils.nowSecs(localtimeOffsetMsec);
  const tsm = exports.calculateTsMac(now, credentials);
  return {
    ts: now,
    tsm
  };
};
