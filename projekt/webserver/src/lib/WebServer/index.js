/*global console*/
import Hapi from 'hapi';
import global from '../Global';
import Crypto from './Crypto';
import api from '../../../../api/src/index';
import scheme from './Hapi/hapiScheme';
import webAppRoutes from './Hapi/webAppRoutes';
import hapiPlugins from './Hapi/hapiPlugins';
import hapiViews from './Hapi/hapiViews';
import validate from './Hapi/validate';

let log = function log(info) {
  console.log(info);
};

let reject = function reject(error) {
  global.logger.error(error);
};

export default class {
  constructor() {
    //
  }

  start() {

    let hapiRoutes = [];

    Array.prototype.push.apply(hapiRoutes, webAppRoutes);
    Array.prototype.push.apply(hapiRoutes, api.routes());

    log('webserver starting...');
    const server = new Hapi.Server();
    server.connection({ port: 3000 });

    server.register(hapiPlugins, (err) => {
      if(err) {
        throw err;
      }
      else {
        server.views(hapiViews);

        let crypto = new Crypto('jwt_secret.txt');
        crypto.initialize((error, secret) => {
          if(error) {
            reject(error);
          }
          else {
            log('jwt_secret retrieved');
            server.app.jwt_secret = secret;
          }
        });

        server.auth.scheme('customjwt', scheme);
        /*
        @TODO:90 draw something, to explain how authentication with hapi and jwt works!
        server.auth.strategy(strategy-name, scheme-name, {options})
        registers a strategy using a scheme.
        strategy-name is the reference we can use to apply the strategy to a certain route.
        scheme-name is refering to the scheme we registered before.
        options is an object, which provides a function to validate the token.
        */
        server.auth.strategy('jwt', 'customjwt', {
          validateFunc: validate
        });

        server.route(hapiRoutes);

        server.state('authentication', {
          path: '/',
          isSecure: false,
          isHttpOnly: false,
          isSameSite: false
        }); //so we can set a cookie via the request-handler

        server.start((err) => {
        	if(err) {
        		throw err;
        	}
          else {
            log('Server running at:', server.info.uri);
          }
        });
        //server.auth.scheme('jwt', scheme);
      }
    });
  }
}
