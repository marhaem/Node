/*global console*/

import Hapi from 'hapi';
import vision from 'vision';
import handlebars from 'handlebars';
import inert from 'inert';

import global from './Global';

import apiRoutes from '../../../api/src/routes';

const PATH_WEBAPP = '../webapp';


export default class {
  constructor() {
    //
  }

  start() {
    let webappRoutes = [{
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
    }, {
      method: 'GET',
      path: '/',
      handler: function(request, reply) {
        return reply.view('index.htm');
      }
    }];

    let hapiRoutes = [];
    Array.prototype.push.apply(hapiRoutes, webappRoutes);
    Array.prototype.push.apply(hapiRoutes, apiRoutes.get());

    let hapiPlugins = [{
      register: inert,
      options: {}
    }, {
      register: vision,
      options: {}
    }];

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
      if (err) {
        throw err;
      }
      else {
        server.views(hapiViews);
        server.route(hapiRoutes);

        server.start((err) => {
          if (err) {
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
