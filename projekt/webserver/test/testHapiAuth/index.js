'use strict';

const Bcrypt = require('bcryptjs');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');

const server = new Hapi.Server();
server.connection({port: 3000});

const validate = function (request, cb) {
	console.log('validate');
	cb('john');
}

const scheme = function scheme(server, options) {
	return {
		authenticate: function authenticate(request, reply) {
			if(!request.headers.authorization) {
				return reply(new Error('Unauthorized'));
			}
			else {
				//do something with req.headers.authorization
				options.validateFunc(request, (a) => {
				return reply.continue({credentials: {user: a}});
				});
			}
		}
	}
}

server.auth.scheme('customAuth', scheme);

server.auth.strategy('auth'/*strategy*/, 'customAuth'/*scheme*/, {validateFunc: validate});

server.route({
	method: 'GET',
	path: '/',
	config: {auth: 'auth'},//strategy
	handler: function(req, rep) {
		rep('hello, ' + req.auth.credentials.user);
	}
});

server.start((err) => {
	if(err) throw err;
	console.log('server running at ' + server.info.uri);
});