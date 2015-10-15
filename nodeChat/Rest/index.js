/*global System, require, __moduleName*/
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

var hapiViews = {
  engines: {
    'html': hapiHtmlViewEngine
  },
  relativeTo: PATH_WEBAPP,
  path: './'
};

import {
  publicRoute
}
from './routes/public';
import {
  chatRoute
}
from './routes/chat';

var hapiRoutes = []
  .concat(publicRoute.get(PATH_WEBAPP))
  .concat(chatRoute.get());

export let index = {
  start: function () {
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
      
      server.connection({
        port: 3000
      });

      server.register(hapiPlugins, function registerCB(error) {
        if (error) {
          reject(new Error("An Error occured! -- " + error));
        } else {
          server.views(hapiViews);
          server.route(hapiRoutes);

          server.start(function startCB(error) {
            if (error) {
              reject(new Error("An Error occured! -- " + error));
            } else {
              resolve(server);
            }
          });
        }
      });
    });
  }
};
