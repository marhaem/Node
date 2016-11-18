/*global console*/

import Hapi from 'hapi';
import hapiBunyan from 'hapi-bunyan';
import hapiJWT from 'hapi-auth-jwt2';
import vision from 'vision';
import handlebars from 'handlebars';
import inert from 'inert';

import global from '../Global';
import jwt from './JWT';
import apiRoutes from '../../../../api/src/routes';
const PATH_WEBAPP = '../webapp';

let log = function log(info) {
  global.logger.info(info);
};

export default class {
  constructor() {
    //
  }
  //@TODO: outsource webappRoutes in file
  start() {
    let webappRoutes = [{
      method: 'GET',
      config: {auth: false},
      path: '/',
      handler: function(request, reply) {
        reply('Hello world!');
      }
    }, {
      method: 'GET',
      config: {auth: false},
      path: '/ping',
      handler: function(request, reply) {
        return reply.view('ping.htm');
      }
    }, {
      method: 'GET',
      config: {auth: false},
      path: '/register',
      handler: function(request, reply) {
        return reply.view('register.htm');
      }
    }, {
      method: 'GET',
      config: {auth: false},
      path: '/login',
      handler: function(request, reply) {
        return reply.view('login.htm');
      }
    }, {
      method: 'GET',
      config: {auth: 'authenticate'},
      path: '/chat',
      handler: function(request, reply) {
        return reply.view('chat.htm');
      }
    }, {
      method: 'GET',
      //@TODO: implement auto-authorization via API-key
      config: {auth: false},
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

    //@TODO: implement function to validate session-token issued by JWT. Also export this function
    let validate = function (decoded, request, callback) {

      let credentials = {
        email: decoded.email,
        password: decoded.password
      };
      //return credentials via callback
      return callback(null, true, credentials);
    };

    /*let validate = function(decoded, request, callback) {
      let now = Date().getTime();
      if(now > decoded.exp) {
        callback(null, false);
      }
      else {
        callback(null, true, decoded);
      }
    };*/

    let hapiViews = {
      engines: {
        'htm': handlebars,
        'html': handlebars
      },
      relativeTo: PATH_WEBAPP,
      path: './'
    };

    console.log('webserver starting...');
    const server = new Hapi.Server();
    server.connection({ port: 3000 });

    server.register(hapiPlugins, (err) => {
      if(err) {
        throw err;
      }
      else {
        server.views(hapiViews);

        //server.auth.scheme('jwt', scheme);
        server.auth.strategy('authenticate', 'jwt', { // JWT2 registered a scheme as 'jwt' this sets the strategy for it: 'authenticate'
          key: 'NeverShareYourSecret',
          validateFunc: validate,
          verifyOptions: {algorithms: [ 'HS256' ]},

        });

        server.route(hapiRoutes);

        server.auth.default('authenticate'); // set 'authenticate' as default strategy

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
