const PATH_WEBAPP = '../webApp';

export default [{
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply('Hello world!');
  }
}, {
  method: 'GET',
  path: '/ping',
  handler: function(request, reply) {
    return reply.view('ping.htm');
  }
}, {
  method: 'GET',
  path: '/register',
  handler: function(request, reply) {
    return reply.view('register.htm');
  }
}, {
  method: 'GET',
  path: '/login',
  handler: function(request, reply) {
    return reply.view('login.htm');
  }
}, {
  method: 'GET',
  config: {auth: 'jwt'},
  path: '/chat',
  handler: function(request, reply) {
    return reply.view('chat.htm');
  }
}, {
  method: 'GET',
  //@TODO: implement auto-authorization via API-key
  path: '/{param*}',
  handler: {
    directory: {
      path: PATH_WEBAPP,
      listing: false,
      index: false,
      lookupCompressed: true
    }
  }
}];
