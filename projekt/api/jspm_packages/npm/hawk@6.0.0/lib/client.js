/* */ 
'use strict';
const Url = require('url');
const Hoek = require('hoek');
const Cryptiles = require('cryptiles');
const Crypto = require('./crypto');
const Utils = require('./utils');
const internals = {};
exports.header = function(uri, method, options) {
  const result = {
    field: '',
    artifacts: {}
  };
  if (!uri || (typeof uri !== 'string' && typeof uri !== 'object') || !method || typeof method !== 'string' || !options || typeof options !== 'object') {
    result.err = 'Invalid argument type';
    return result;
  }
  const timestamp = options.timestamp || Utils.nowSecs(options.localtimeOffsetMsec);
  const credentials = options.credentials;
  if (!credentials || !credentials.id || !credentials.key || !credentials.algorithm) {
    result.err = 'Invalid credential object';
    return result;
  }
  if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
    result.err = 'Unknown algorithm';
    return result;
  }
  if (typeof uri === 'string') {
    uri = Url.parse(uri);
  }
  const artifacts = {
    ts: timestamp,
    nonce: options.nonce || Cryptiles.randomString(6),
    method,
    resource: uri.pathname + (uri.search || ''),
    host: uri.hostname,
    port: uri.port || (uri.protocol === 'http:' ? 80 : 443),
    hash: options.hash,
    ext: options.ext,
    app: options.app,
    dlg: options.dlg
  };
  result.artifacts = artifacts;
  if (!artifacts.hash && (options.payload || options.payload === '')) {
    artifacts.hash = Crypto.calculatePayloadHash(options.payload, credentials.algorithm, options.contentType);
  }
  const mac = Crypto.calculateMac('header', credentials, artifacts);
  const hasExt = artifacts.ext !== null && artifacts.ext !== undefined && artifacts.ext !== '';
  let header = 'Hawk id="' + credentials.id + '", ts="' + artifacts.ts + '", nonce="' + artifacts.nonce + (artifacts.hash ? '", hash="' + artifacts.hash : '') + (hasExt ? '", ext="' + Hoek.escapeHeaderAttribute(artifacts.ext) : '') + '", mac="' + mac + '"';
  if (artifacts.app) {
    header = header + ', app="' + artifacts.app + (artifacts.dlg ? '", dlg="' + artifacts.dlg : '') + '"';
  }
  result.field = header;
  return result;
};
exports.authenticate = function(res, credentials, artifacts, options, callback) {
  artifacts = Hoek.clone(artifacts);
  options = options || {};
  let wwwAttributes = null;
  let serverAuthAttributes = null;
  const finalize = function(err) {
    if (callback) {
      const headers = {
        'www-authenticate': wwwAttributes,
        'server-authorization': serverAuthAttributes
      };
      return callback(err, headers);
    }
    return !err;
  };
  if (res.headers['www-authenticate']) {
    wwwAttributes = Utils.parseAuthorizationHeader(res.headers['www-authenticate'], ['ts', 'tsm', 'error']);
    if (wwwAttributes instanceof Error) {
      wwwAttributes = null;
      return finalize(new Error('Invalid WWW-Authenticate header'));
    }
    if (wwwAttributes.ts) {
      const tsm = Crypto.calculateTsMac(wwwAttributes.ts, credentials);
      if (tsm !== wwwAttributes.tsm) {
        return finalize(new Error('Invalid server timestamp hash'));
      }
    }
  }
  if (!res.headers['server-authorization'] && !options.required) {
    return finalize();
  }
  serverAuthAttributes = Utils.parseAuthorizationHeader(res.headers['server-authorization'], ['mac', 'ext', 'hash']);
  if (serverAuthAttributes instanceof Error) {
    serverAuthAttributes = null;
    return finalize(new Error('Invalid Server-Authorization header'));
  }
  artifacts.ext = serverAuthAttributes.ext;
  artifacts.hash = serverAuthAttributes.hash;
  const mac = Crypto.calculateMac('response', credentials, artifacts);
  if (mac !== serverAuthAttributes.mac) {
    return finalize(new Error('Bad response mac'));
  }
  if (!options.payload && options.payload !== '') {
    return finalize();
  }
  if (!serverAuthAttributes.hash) {
    return finalize(new Error('Missing response hash attribute'));
  }
  const calculatedHash = Crypto.calculatePayloadHash(options.payload, credentials.algorithm, res.headers['content-type']);
  if (calculatedHash !== serverAuthAttributes.hash) {
    return finalize(new Error('Bad response payload mac'));
  }
  return finalize();
};
exports.getBewit = function(uri, options) {
  if (!uri || (typeof uri !== 'string' && typeof uri !== 'object') || !options || typeof options !== 'object' || !options.ttlSec) {
    return '';
  }
  options.ext = (options.ext === null || options.ext === undefined ? '' : options.ext);
  const now = Utils.now(options.localtimeOffsetMsec);
  const credentials = options.credentials;
  if (!credentials || !credentials.id || !credentials.key || !credentials.algorithm) {
    return '';
  }
  if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
    return '';
  }
  if (typeof uri === 'string') {
    uri = Url.parse(uri);
  }
  const exp = Math.floor(now / 1000) + options.ttlSec;
  const mac = Crypto.calculateMac('bewit', credentials, {
    ts: exp,
    nonce: '',
    method: 'GET',
    resource: uri.pathname + (uri.search || ''),
    host: uri.hostname,
    port: uri.port || (uri.protocol === 'http:' ? 80 : 443),
    ext: options.ext
  });
  const bewit = credentials.id + '\\' + exp + '\\' + mac + '\\' + options.ext;
  return Hoek.base64urlEncode(bewit);
};
exports.message = function(host, port, message, options) {
  if (!host || typeof host !== 'string' || !port || typeof port !== 'number' || message === null || message === undefined || typeof message !== 'string' || !options || typeof options !== 'object') {
    return null;
  }
  const timestamp = options.timestamp || Utils.nowSecs(options.localtimeOffsetMsec);
  const credentials = options.credentials;
  if (!credentials || !credentials.id || !credentials.key || !credentials.algorithm) {
    return null;
  }
  if (Crypto.algorithms.indexOf(credentials.algorithm) === -1) {
    return null;
  }
  const artifacts = {
    ts: timestamp,
    nonce: options.nonce || Cryptiles.randomString(6),
    host,
    port,
    hash: Crypto.calculatePayloadHash(message, credentials.algorithm)
  };
  const result = {
    id: credentials.id,
    ts: artifacts.ts,
    nonce: artifacts.nonce,
    hash: artifacts.hash,
    mac: Crypto.calculateMac('message', credentials, artifacts)
  };
  return result;
};
