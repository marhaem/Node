import jwt from 'jsonwebtoken';
import global from './Global';

let log = function log(info) {
  console.log(info);
};

let reject = function reject(error) {
  global.logger.error(error);
};

let expiry = 3600;

export default {
  method: 'POST',
  path: '/api/v1/login',
  config: {auth:false},
  handler: function(request, reply) {
    if(!request.payload || !request.payload.email || !request.payload.password) {
      reject('login failed: no email or password given');
      return reply({
        data: 'no email or password given'
      })
      .code(418);
    }
    else {
      global.models.User.login({
        "email": request.payload.email,
        "password": request.payload.password
      }).then((user) => { // => { user }
        //return reply.redirect('/chat').code(302);
        //return reply.redirect('/chat').send();
        //request.setUrl('http://localhost:3000/chat');
        log('retrieving token');
        let token = jwt.sign({userID: user.userID}, request.server.app.jwt_secret, {algorithm: 'HS256', expiresIn: expiry});
        log('token retrieved');
        return reply({
          data: '/chat'
        })
        .state('Authorization', token)
        .code(302);//anything else than 200 OK will enter .fail in jquery -_-, meh.
      }, (error) => {
        //@TODO: implement correct http-status-codes. wrong credentials: 401, user locked: do not differentiate or else existence of users could be hacked
        //http://stackoverflow.com/questions/1959947/whats-an-appropriate-http-status-code-to-return-by-a-rest-api-service-for-a-val
        return reply({
          data: error.message
        }).code(401);
      });
    }
  }
};
