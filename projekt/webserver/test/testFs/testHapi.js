let Hapi = require('Hapi');

const server = new Hapi.Server();
server.connection({ port: 80 });

const scheme = function (server, options) {

    return {
        api: {
            settings: {
                x: 5
            }
        },
        authenticate: function (request, reply) {

            const req = request.raw.req;
            const authorization = req.headers.authorization;
            if (!authorization) {
                return reply(Boom.unauthorized(null, 'Custom'));
            }

            return reply.continue({ credentials: { user: 'john' } });
        }
    };
};

server.auth.scheme('a', scheme); // reigster scheme with a name
server.auth.strategy('default', 'a'); // define registered scheme as default

console.log(server.auth.api.default.settings.x);