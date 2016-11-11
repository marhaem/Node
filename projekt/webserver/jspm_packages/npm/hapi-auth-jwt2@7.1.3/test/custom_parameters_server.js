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
  return db[decoded.id].allowed ? callback(null, true) : callback(null, false);
};
var home = function(req, reply) {
  return reply('Hai!');
};
var privado = function(req, reply) {
  return reply('worked');
};
server.register(require('../lib/index'), function() {
  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    validateFunc: validate,
    verifyOptions: {algorithms: ['HS256']},
    urlKey: 'customUrlKey',
    cookieKey: 'customCookieKey',
    tokenType: 'MyAuthScheme'
  });
  server.route([{
    method: 'GET',
    path: '/',
    handler: home,
    config: {auth: false}
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
  }, {
    method: 'POST',
    path: '/optional',
    handler: privado,
    config: {auth: {
        mode: 'optional',
        strategy: 'jwt'
      }}
  }, {
    method: 'POST',
    path: '/try',
    handler: privado,
    config: {auth: {
        mode: 'try',
        strategy: 'jwt'
      }}
  }]);
});
module.exports = server;
