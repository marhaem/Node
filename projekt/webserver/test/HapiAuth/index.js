/*global console*/
/*jshint -W116*/

import Hapi from 'hapi';
import jwt from 'jsonwebtoken';
const schemeName = 'custom';

const log = function log(err) {
	console.log(err);
};

const validate = function validate(decoded, cb) {
	//do something with decoded.(...)
	const date = new Date();
	if(decoded.exp <= date.getTime()) {
		log('decoded: ' + JSON.stringify(decoded));
		cb(null, decoded.id);
	}
	else {
		cb(new Error('token is expired'));
	}
};

const scheme = function scheme(server, options) {
	return {
		authenticate: function authenticate(request, reply) {
			if(!request.headers.authorization) {
				log('no token');
				return reply(new Error('Unauthorized'));
			}
			else {
				//do something with req.headers.authorization
				jwt.verify(request.headers.authorization, 'hevdf32q54hz', (err, decoded) => {
					if(err) {
						log('invalid token');
						return reply(new Error('Unauthorized'));
					}
					else {
						options.validateFunc(decoded, (err, id) => {
							if(err) {
								return reply(new Error('Unauthorized'));
							}
							else {
								return reply.continue({credentials: {userID: id}});
							}
						});
					}
				});
			}
		}
	};
};

const hapiRoutes = [{
	method: 'GET',
	path: '/getToken',
	handler: function(request, reply) {
		const token = jwt.sign({id: 42}, 'hevdf32q54hz', {expiresIn: 3600});
		reply({
			message: 'token retrieved',
			data: token
		}).code(200);
	}
}, {
	method: 'GET',
	path: '/validateToken',
	config: {auth: 'default'},
	handler: function(request, reply) {
		//do something with request.auth.(...)
		reply({
			message: 'legit',
			userID: request.auth.userID
		}).code(200);
	}
}];

export default class {
	constructor() {
		//
	}
	start() {
		const server = new Hapi.Server();
		server.connection({port: 3000});

		server.auth.scheme('custom', scheme);
		server.auth.strategy('default'/*strategy*/, 'custom'/*scheme*/, {validateFunc: validate});
		log('seavus');

		server.route(hapiRoutes);

		server.start((err) => {
			if(err) throw err;
			log('server running at ' + server.info.uri);
		});
	}
}
