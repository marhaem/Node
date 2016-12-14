/*global console*/
import jwt from 'jsonwebtoken';
import global from './Global';

let log = function log(info) {
  console.log(info);
};

let reject = function reject(error) {
  global.logger.error(error);
};

let expiry = 3600; // in seconds, so session is valid for one hour

export default {
  method: 'POST',
  path: '/api/v1/login',
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

        // session token contains the userID
        /*@TODO: Method 1: is the user id enough? wouldn't it be better, to have an
        session-storage or database(idea) which maps hashes to the userID and settings, etc.
        this method saves bandwith and encryption-workload, but data needs to be locally stored*/
        /*@TODO: Method 2: store a little more data about the user, encrypted and signed.
        This method uses more bandwidth, also encryption can fail*/
        /*@TODO: we need an authorization scope, e.g. settings-object*/
        /*@TODO: who reissues tokens, once they get outdated???*/
        let token = jwt.sign({
          userID: user.userID
        }, request.server.app.jwt_secret, {
          algorithm: 'HS256', expiresIn: expiry
        });
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
