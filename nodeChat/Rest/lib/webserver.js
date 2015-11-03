/*global System, __moduleName, console*/
/*jshint esnext:true*/

import Process from 'process';
import Fs from 'fs';
import Path from 'path';
import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
import HapiBunyan from 'hapi-bunyan';
import hapiHtmlViewEngine from 'handlebars';

const __root = Process.cwd().replace(/\\|\//g, Path.sep);
const PATH_LOGFILES = Path.join(__root, 'logs');
const PATH_WEBAPP = Path.join(__root, '..', 'WebApp');

import {publicRoute} from '../routes/public';
import {chatRoute} from '../routes/chat';

export let WebServer = {
  init: function init(Bunyan) {
    return new Promise(function (resolve, reject) {
      // make sure log path exists
      Fs.mkdir(PATH_LOGFILES, 0x777, function mkdirCB(error) {
        if (error && error.code !== 'EEXIST') {
          // only reject errors other than folder already exists
          reject(error);
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
            register: HapiBunyan, //@TODO take a look at hapi-bunyan/lib/index.js and fix the on every request initialization as well as on request-error to contain url and parameter information
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

              // little plugin to log the request url along with the error, to get some sense out of the log
              // @TODO should also be used to deliver special error pages without disclosing any information to the client (prettier than {"statusCode":404,"error":"Not Found"} and such...)
              server.ext('onPostHandler', function (request, reply) {
                let response = request.response;
                if (response.isBoom && response.output.statusCode === 404) {
                  console.log(request.raw.req.url);
                  return reply.continue();
                  //return reply.file('404.html').code(404);
                }
                else {
                  return reply.continue();
                }
              });

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