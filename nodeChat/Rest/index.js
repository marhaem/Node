var Path = require('path');
var Hapi = require('hapi');
var Inert = require('inert');

var server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  }
});
server.connection({
  port: 3000
});

server.register(Inert, function () {});

server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: '../WebApp/',
      listing: false,
      index: false,
      lookupCompressed: true
    }
  }
});

server.start(function (err) {

  if (err) {
    throw err;
  }

  console.log('Server running at:', server.info.uri);
});
