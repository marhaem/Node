/*global System, __moduleName*/
/*jshint esnext:true*/

import Path from 'path';
import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
import hapiHtmlViewEngine from 'handlebars';

let __dirname = Path.dirname(System.normalizeSync('index', __moduleName).substr(7));
const PATH_WEBAPP = Path.normalize(Path.join(__dirname, '..', 'WebApp'));

var hapiPlugins = [
  Inert,
  Vision
];

import {
  publicRoute
}
from '../routes/public';
import {
  chatRoute
}
from '../routes/chat';

export let WebServer = {
  init: function init() {
    return new Promise(function (resolve, reject) {
      var server = new Hapi.Server({
        debug: {
          request: ['error', 'uncaught']
        },
        mime: { // this does not work somehow...
          override: {
            'text/html': {
              source: 'iana',
              compressible: true,
              extensions: ['woff2'],
              type: 'application/font-woff2'
            }
          }
        }
      });

      var hapiRoutes = []
        .concat(publicRoute.get(PATH_WEBAPP))
        .concat(chatRoute.get());

      var hapiViews = {
        engines: {
          'html': hapiHtmlViewEngine
        },
        relativeTo: PATH_WEBAPP,
        path: './'
      };

      server.connection({
        port: 3000
      });

      server.register(hapiPlugins, function registerCB(error) {
        if (error) {
          console.log('Webserver Initialization: ERROR');
          console.log('Could not register plugins');
          reject(error);
        } else {
          server.views(hapiViews);
          server.route(hapiRoutes);
          server.start(function startCB(error) {
            if (error) {
              console.log('Webserver Initialization: ERROR');
              console.log('Could not start webserver');
              reject(error);
            } else {
              console.log('Webserver Initialization: OK');
              console.log('Webserver running at: ' + server.info.uri);
              resolve(server);
            }
          });
        }
      });
    });
  }
};