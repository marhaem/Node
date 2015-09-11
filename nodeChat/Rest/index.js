var Hapi = require('hapi');
var fs = require('fs'); 

var server = new Hapi.Server();
server.connection({ port: 3000 });

server.start(function () {
    console.log('Server running at:', server.info.uri);
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello!');
    }
});
server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});
server.route({
    method: 'GET',
    path: '/login',
    handler: function(request, reply) {
        reply(fs.createReadStream('index.html'));
    }
});
        