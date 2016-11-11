/* */ 
var Hapi = require('hapi');
var secret = 'NeverShareYourSecret';
var server = new Hapi.Server({debug: false});
server.connection();
var db = {
  "123": {
    allowed: true,
    "name": "Charlie"
  },
  "321": {
    allowed: false,
    "name": "Old Gregg"
  }
};
var validate = function(decoded, request, callback) {
  if (db[decoded.id].allowed) {
    return callback(null, true);
  } else {
    return callback(null, false);
  }
};
var home = function(req, reply) {
  return reply('Hai!');
};
var privado = function(req, reply) {
  return reply('worked');
};
var sendToken = function(req, reply) {
  return reply(req.auth.token);
};
var responseFunction = function(req, reply, callback) {
  var error = null;
  if (req.headers.error === 'true') {
    error = new Error('failed');
  } else {
    req.response.header('Authorization', 'from scheme response function');
  }
  callback(error);
};
server.register(require('../lib/index'), function() {
  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: {algorithms: ['HS256']},
    responseFunc: responseFunction
  });
  server.route([{
    method: 'GET',
    path: '/',
    handler: home,
    config: {auth: false}
  }, {
    method: 'GET',
    path: '/token',
    handler: sendToken,
    config: {auth: 'jwt'}
  }, {
    method: 'POST',
    path: '/privado',
    handler: privado,
    config: {auth: 'jwt'}
  }, {
    method: 'POST',
    path: '/required',
    handler: privado,
    config: {auth: {
        mode: 'required',
        strategy: 'jwt'
      }}
  }]);
});
module.exports = server;
