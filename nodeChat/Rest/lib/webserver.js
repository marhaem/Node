/*global System, __moduleName, console*/
/*jshint esnext:true*/

import Fs from 'fs';
import Path from 'path';
import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
import HapiBunyan from 'hapi-bunyan';
import hapiHtmlViewEngine from 'handlebars';

const __root = Path.normalize(Path.dirname(System.normalizeSync('index', __moduleName).replace(/^[^:]*:\/*/g, '')));
const PATH_LOGFILES = Path.join(__root, 'logs');
const PATH_WEBAPP = Path.join(__root, '..', 'WebApp');

import {publicRoute} from '../routes/public';
import {chatRoute} from '../routes/chat';

export let WebServer = {
  init: function init(Bunyan) {
    return new Promise(function (resolve, reject) {
      // make sure log path exists
      Fs.mkdir(PATH_LOGFILES, 0x777, function mkdirCB(error) {
        if (error) {
          if (error.code !== 'EEXIST') {  // ignore the error if the folder already exists
            reject(error);
          }
        }
        else {
          // start server
          let server = new Hapi.Server({
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

          let hapiPlugins = [{
            register: Inert,
            options: {}
          }, {
            register: Vision,
            options: {}
          }, {
            register: HapiBunyan,
            options: {
              logger: Bunyan.createLogger({
                name: 'WebServer',
                level: 'debug',
                streams: [{
                  type: 'rotating-file',
                  path: Path.join(PATH_LOGFILES, 'webserver.log'),
                  period: '1d',   // daily rotation
                  count: 14       // keep 14 back copies
                }]
              }),
            }
          }];

          let hapiRoutes = []
            .concat(publicRoute.get(PATH_WEBAPP))
            .concat(chatRoute.get());

          let hapiViews = {
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
        }
      });
    });
  }
};