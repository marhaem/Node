/*global require, __dirname */

var Path = require('path');
var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var hapiHtmlViewEngine = require('handlebars');

var PATH_WEBAPP = Path.normalize(Path.join(__dirname, '..', 'WebApp'));

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

var hapiRoutes = []
  .concat(require('./routes/public').get(PATH_WEBAPP))
  .concat(require('./routes/chat').get());

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
    throw error;
  } else {
    server.views(hapiViews);
    server.route(hapiRoutes);

    server.start(function startCB(error) {
      if (error) {
        throw error;
      } else {
        console.log('info', 'Server running at: ' + server.info.uri);
      }
    });
  }
});
