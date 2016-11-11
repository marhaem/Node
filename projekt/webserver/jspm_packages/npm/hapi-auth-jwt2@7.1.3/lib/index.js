/* */ 
var Boom = require('boom');
var assert = require('assert');
var JWT = require('jsonwebtoken');
var extract = require('./extract');
var pkg = require('../package.json!systemjs-json');
var internals = {};
exports.register = function(server, options, next) {
  server.auth.scheme('jwt', internals.implementation);
  next();
};
exports.register.attributes = {pkg: pkg};
internals.isFunction = function(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};
internals.implementation = function(server, options) {
  assert(options, 'options are required for jwt auth scheme');
  assert(options.validateFunc || options.verifyFunc, 'validateFunc OR verifyFunc function is required!');
  var raiseError = function(errorType, message, scheme, attributes) {
    if (options.errorFunc && internals.isFunction(options.errorFunc)) {
      var errorContext = {
        errorType: errorType,
        message: message,
        scheme: scheme,
        attributes: attributes
      };
      errorContext = options.errorFunc(errorContext);
      if (errorContext) {
        errorType = errorContext.errorType;
        message = errorContext.message;
        scheme = errorContext.scheme;
        attributes = errorContext.attributes;
      }
    }
    return Boom[errorType](message, scheme, attributes);
  };
  return {
    authenticate: function(request, reply) {
      var token = extract(request, options);
      var tokenType = options.tokenType || 'Token';
      if (!token) {
        return reply(raiseError('unauthorized', null, tokenType));
      }
      if (!extract.isValid(token)) {
        return reply(raiseError('unauthorized', 'Invalid token format', tokenType));
      }
      request.auth.token = token;
      var decoded;
      try {
        decoded = JWT.decode(token, {complete: options.complete || false});
      } catch (e) {
        return reply(raiseError('unauthorized', 'Invalid token format', tokenType));
      }
      if (options.key && typeof options.validateFunc === 'function') {
        var keyFunc = (internals.isFunction(options.key)) ? options.key : function(decoded, callback) {
          callback(null, options.key);
        };
        keyFunc(decoded, function(err, key, extraInfo) {
          if (err) {
            return reply(raiseError('wrap', err));
          }
          if (extraInfo) {
            request.plugins[pkg.name] = {extraInfo: extraInfo};
          }
          var verifyOptions = options.verifyOptions || {};
          JWT.verify(token, key, verifyOptions, function(err, decoded) {
            if (err) {
              return reply(raiseError('unauthorized', 'Invalid token', tokenType), null, {credentials: null});
            } else {
              options.validateFunc(decoded, request, function(err, valid, credentials) {
                if (err) {
                  return reply(raiseError('wrap', err));
                } else if (!valid) {
                  return reply(raiseError('unauthorized', 'Invalid credentials', tokenType), null, {credentials: credentials || decoded});
                } else {
                  return reply.continue({
                    credentials: credentials || decoded,
                    artifacts: token
                  });
                }
              });
            }
          });
        });
      } else {
        options.verifyFunc(decoded, request, function(err, valid, credentials) {
          if (err) {
            return reply(raiseError('wrap', err));
          } else if (!valid) {
            return reply(raiseError('unauthorized', 'Invalid credentials', tokenType), null, {credentials: decoded});
          } else {
            return reply.continue({
              credentials: credentials || decoded,
              artifacts: token
            });
          }
        });
      }
    },
    response: function(request, reply) {
      if (options.responseFunc && typeof options.responseFunc === 'function') {
        options.responseFunc(request, reply, function(err) {
          if (err) {
            return reply(raiseError('wrap', err));
          } else {
            reply.continue();
          }
        });
      } else {
        reply.continue();
      }
    }
  };
};
