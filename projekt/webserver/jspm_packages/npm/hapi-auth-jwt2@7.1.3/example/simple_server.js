/* */ 
var Hapi = require('hapi');
var people = {1: {
    id: 1,
    name: 'Jen Jones'
  }};
var validate = function(decoded, request, callback) {
  if (!people[decoded.id]) {
    return callback(null, false);
  } else {
    return callback(null, true);
  }
};
var server = new Hapi.Server();
server.connection({port: 8000});
server.register(require('../lib/index'), function(err) {
  if (err) {
    console.log(err);
  }
  server.auth.strategy('jwt', 'jwt', {
    key: 'NeverShareYourSecret',
    validateFunc: validate
  });
  server.auth.default('jwt');
  server.route([{
    method: "GET",
    path: "/",
    config: {auth: false},
    handler: function(request, reply) {
      reply({text: 'Token not required'});
    }
  }, {
    method: 'GET',
    path: '/restricted',
    config: {auth: 'jwt'},
    handler: function(request, reply) {
      reply({text: 'You used a Token!'}).header("Authorization", request.headers.authorization);
    }
  }]);
});
server.start(function() {
  console.log('Server running at:', server.info.uri);
});
