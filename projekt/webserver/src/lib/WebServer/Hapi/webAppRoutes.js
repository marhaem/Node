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
  config: {auth: 'jwt'},
  handler: function(request, reply) {
    //console.log(request.state);
    /*credentials is accessible via request.auth.credentials*/
    if(request.auth.credentials === 'unauthorized') {
      return reply.view('login.htm');
    }
    else {
      return reply.redirect('/chat');
    }
  }
}, {
  method: 'GET',
  path: '/chat',
  config: {auth: 'jwt'}, // 'jwt' is a reference to the authentication-strategy we registered in ../index.js
  handler: function(request, reply) {
    /*credentials is accessible via request.auth.credentials*/
    if(request.auth.credentials === 'unauthorized') {
      return reply.redirect('/login');
    }
    else if(request.auth.credentials === 'expired') {
      return reply().unstate('authentication').redirect('/login');
    }
    else {
      return reply.view('chat.htm');
    }
  }
}, {
  method: 'GET',
  //@TODO:130 implement auto-authorization via API-key
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
