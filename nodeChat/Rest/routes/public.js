/*global module, process, require, __dirname */

(function () {
  'use strict';

  var path = require('path');

  /**
   * Creates a route to the given `file` on the webservers root.
   * That route will be mapped to a file in the /public folder on the webserver.
   * The handler will be a simple file handler.
   */
  function createRouteRootToPublicFileHandler(absolutePublicPath, file) {
    return {
      method: 'GET',
      path: '/' + file,
      handler: {
        file: {
          path: path.join(absolutePublicPath, file),
          lookupCompressed: true
        }
      }
    };
  }

  /**
   * Creates routes on the webserver root for all specified `files` mapped to the /public folder (e.g. /favicon.ico -> /public/favicon.ico).
   */
  function createPublicRoutesForFiles(absolutePublicPath, files) {
    var routes = [];
    var addRoute = function addRoute(file) {
      routes.push(createRouteRootToPublicFileHandler(absolutePublicPath, file));
    };

    files.forEach(addRoute);

    return routes;
  }

  /**
   * Creates a route to the given `folder` on the webservers root.
   * That route will be mapped to a folder in the /public folder on the webserver.
   * The hanlder will be a simple directory handler.
   */
  function createRouteRootToPublicDirectoryHandler(absolutePublicPath, folder) {
    return {
      method: 'GET',
      path: '/' + folder + '/{p*}',
      handler: {
        directory: {
          path: path.join(absolutePublicPath, folder),
          listing: false,
          index: false,
          lookupCompressed: true
        }
      }
    };
  }

  /**
   * Creates routes on the webserver root for all specified `folders` mapped to the /public folder (e.g. /img -> /public/img).
   */
  function createPublicRoutesForFolders(absolutePublicPath, folders) {
    var routes = [];
    var addRoute = function addRoute(folder) {
      routes.push(createRouteRootToPublicDirectoryHandler(absolutePublicPath, folder));
    };

    // for development styles are proccessed by plugin
    if (process.env.NODE_ENV === 'development') {
      require('lodash').remove(folders, function pathRemovalForDebug(path) {
        return path === 'styles';
      });
    }

    folders.forEach(addRoute);

    return routes;
  }

  module.exports = {
    get: function get(credentialStore, absolutePublicPath, absoluteWebappPath) {
      /*return createPublicRoutesForFiles(absolutePublicPath, ['favicon.ico'])
        .concat(createPublicRoutesForFolders(absolutePublicPath, ['img', 'js', 'styles']));*/
      return [{
        method: 'GET',
        path: '/{param*}',
        handler: {
          directory: {
            path: absoluteWebappPath,
            listing: false,
            index: false,
            lookupCompressed: true
          }
        }
      }].concat(createPublicRoutesForFiles(absolutePublicPath, ['favicon.ico']));
    }
  };
})();