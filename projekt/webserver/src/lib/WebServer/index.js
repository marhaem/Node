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
  global.logger.info(info);
};

let reject = function reject(error) {
  global.logger.error(error);
};

export default class {
  constructor() {
    this.PATH_WEBAPP = '../webapp';
  }

  start() {

    let hapiRoutes = [];

    Array.prototype.push.apply(hapiRoutes, webAppRoutes);
    Array.prototype.push.apply(hapiRoutes, api.routes());

    console.log('webserver starting...');
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

        server.auth.strategy('jwt', 'customjwt', {
          validateFunc: validate
        });

        server.route(hapiRoutes);

        server.state('Authorization');

        server.start((err) => {
        	if(err) {
        		throw err;
        	}
          else {
            console.log('Server running at:', server.info.uri);
          }
        });
        //server.auth.scheme('jwt', scheme);
      }
    });
  }
}
