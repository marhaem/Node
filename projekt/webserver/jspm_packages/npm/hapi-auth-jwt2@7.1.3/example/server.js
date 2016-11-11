/* */ 
(function(process) {
  var Hapi = require('hapi');
  var hapiAuthJWT = require('../lib/index');
  var JWT = require('jsonwebtoken');
  var port = process.env.PORT || 8000;
  var secret = 'NeverShareYourSecret';
  var people = {1: {
      id: 1,
      name: 'Anthony Valid User'
    }};
  var token = JWT.sign(people[1], secret);
  console.log(token);
  var validate = function(decoded, request, callback) {
    console.log(" - - - - - - - decoded token:");
    console.log(decoded);
    console.log(" - - - - - - - request info:");
    console.log(request.info);
    console.log(" - - - - - - - user agent:");
    console.log(request.headers['user-agent']);
    if (!people[decoded.id]) {
      return callback(null, false);
    } else {
      return callback(null, true);
    }
  };
  var server = new Hapi.Server();
  server.connection({port: port});
  server.register(hapiAuthJWT, function(err) {
    if (err) {
      console.log(err);
    }
    server.auth.strategy('jwt', 'jwt', {
      key: secret,
      validateFunc: validate,
      verifyOptions: {ignoreExpiration: true}
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
        reply({message: 'You used a Valid JWT Token to access /restricted endpoint!'}).header("Authorization", request.headers.authorization);
      }
    }]);
  });
  server.start(function() {
    console.log('Server running at:', server.info.uri);
  });
})(require('process'));
