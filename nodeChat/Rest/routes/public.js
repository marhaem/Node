/*global module */

export let publicRoute = {
  get: function(PATH_WEBAPP) {
  return [{
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
      return reply.view('index');
    }
  }];
}};