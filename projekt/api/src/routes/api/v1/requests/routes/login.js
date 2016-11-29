import JWT from '../JWT';

let log = function log(info) {
  this.global.logger.info(info);
};

let reject = function reject(error) {
  this.global.logger.error(error);
};

export default {
  method: 'POST',
  config: {auth: false},
  path: '/api/v1/login',
  handler: function(request, reply) {
    //console.log(request);
    if(!request.payload || !request.payload.email || !request.payload.password) {
      log('loggin failed: no email or password given');
      return reply({
        data: 'no email or password given'
      })
      .code(418);
    }
    else {
      this.global.models.User.login({
        "email": request.payload.email,
        "password": request.payload.password
      }).then((user) => { // => { user }
        //console.log('request: ' + request);
        //console.log('reply: ' + reply);
        //return reply.redirect('/chat').code(302);
        //return reply.redirect('/chat').send();
        //request.setUrl('http://localhost:3000/chat');
        //let token = jwt.getToken(user.userID);

        return reply({
          //token: token,
          data: '/chat'
        })
        .state('data', {firstVisit: 'false'} )
        .code(302);//anything else than 200 OK will enter .fail in jquery -_-, meh.
      }, (error) => {
        //@TODO: implement correct http-status-codes. wrong credentials: 401, user locked: do not differentiate or else existence of users could be hacked
        //http://stackoverflow.com/questions/1959947/whats-an-appropriate-http-status-code-to-return-by-a-rest-api-service-for-a-val
        reject(error);
        reply({
          data: error
        }).code(401);
      });
    }
  }
};
