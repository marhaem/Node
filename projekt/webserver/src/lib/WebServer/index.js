/*global console*/

import Hapi from 'hapi';
import hapiBunyan from 'hapi-bunyan';
import hapiJWT from 'hapi-auth-jwt2';
import vision from 'vision';
import handlebars from 'handlebars';
import inert from 'inert';


import global from './Global';

import apiRoutes from '../../../../api/src/routes';

const PATH_WEBAPP = '../webapp';

export default class {
  constructor() {
    //
  }
  //@TODO: outsource webappRoutes in file
  start() {
    let webappRoutes = [{
      method: 'GET',
      path: '/',
      handler: function(request, reply) {
        reply('Hello world!');
      }
    }, {
      method: 'GET',
      path: '/ping',
      handler: function(request, reply) {
        return reply.view('ping.htm');
      }
    }, {
      method: 'GET',
      path: '/register',
      handler: function(request, reply) {
        return reply.view('register.htm');
      }
    }, {
      method: 'GET',
      path: '/login',
      handler: function(request, reply) {
        return reply.view('login.htm');
      }
    }, {
      method: 'GET',
      config: {auth: 'jwt'},
      path: '/chat',
      handler: function(request, reply) {
        return reply.view('chat.htm');
      }
    }, {
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: PATH_WEBAPP,
          listing: false,
          index: false,
          lookupCompressed: true
        }
      }
    }];

    let hapiRoutes = [];

    Array.prototype.push.apply(hapiRoutes, webappRoutes);
    Array.prototype.push.apply(hapiRoutes, apiRoutes.get());

    let hapiPlugins = [{
      register: vision,
      options: {}
    }, {
      register: inert,
      options: {}
    }, {
      register: hapiBunyan,
      options: {
        logger: global.logger
      }
    }, {
      register: hapiJWT,
      options: {}
    }];

    let validate = function(decoded, request, callback) {
      let now = Date().getTime();
      if(now > decoded.exp) {
        callback(null, false);
      }
      else {
        callback(null, true, decoded);
      }

    let hapiViews = {
      engines: {
        'htm': handlebars,
        'html': handlebars
      },
      relativeTo: PATH_WEBAPP,
      path: './'
    };

    global.logger.info('webserver starting');
    const server = new Hapi.Server();
    server.connection({ port: 3000 });

    server.register(hapiPlugins, (err) => {
      if(err) {
        throw err;
      }
      else {
        server.views(hapiViews);
        server.route(hapiRoutes);
        server.auth.strategy('jwt', 'jwt', {
          key: 'secret',
          validateFunc: validate,
          verifyOptions: {algorithms: [ 'HS256' ]}
        });
        server.start((err) => {
        	if(err) {
        		throw err;
        	}
          else {
            console.log('Server running at:', server.info.uri);
          }
        });
      }
    });
  }
}
