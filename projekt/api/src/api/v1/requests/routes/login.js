/*global console*/
import jwt from 'jsonwebtoken';
import boom from 'boom';
import global from './Global';

let log = function log(info) {
  console.log(info);
};

let reject = function reject(error) {
  global.logger.error(error);
};

let expiry = 3600; // in seconds, so session is valid for one hour

/*@TODO:10 Method 1: is the user id enough? wouldn't it be better, to have an
session-storage or database(idea) which maps hashes to the userID and settings, etc.
this method saves bandwith and encryption-workload, but data needs to be locally stored*/
/*@TODO:30 Method 2: store a little more data about the user, encrypted and signed.
This method uses more bandwidth, also encryption can fail*/
/*@TODO:220 we need an authorization scope, e.g. settings-object*/
/*@TODO:230 reissue token on every request*/
//@TODO:140 implement correct http-status-codes. wrong credentials: 401, user locked: do not differentiate or else existence of users could be hacked
//http://stackoverflow.com/questions/1959947/whats-an-appropriate-http-status-code-to-return-by-a-rest-api-service-for-a-val

export default {
  method: 'POST',
  path: '/api/v1/login',
  config: {auth: 'jwt'},
  handler: function(request, reply) {
    // if the client is already authenticated -> reroute to chat
    // rerouting on an ajax request seems a little odd, but this route could be used to refresh the token
    //log(request.auth.credentials);
    log('login#headers: ' + JSON.stringify(request.headers));
    //log('headers ' + JSON.stringify(request.headers));
    //log('payload ' + JSON.stringify(request.payload));
    if(request.auth.credentials === 'unauthorized') {
      // not authenticated: check if proper credentials are provided with the request
      if(!request.payload || !request.payload.email || !request.payload.password) {
        reject('login failed: no email or password given');
        return reply(boom.badRequest('no email or password given')).code(401);
      }
      else {
        // lookup user in database
        global.models.User.login({
          "email": request.payload.email,
          "password": request.payload.password
        }).then((user) => {
          //return reply.redirect('/chat').code(302);
          //return reply.redirect('/chat').send();
          //request.setUrl('http://localhost:3000/chat');
          // user is legit: create a token bound to the users session
          jwt.sign({
            userID: user.userID
          }, request.server.app.jwt_secret, {
            algorithm: 'HS256', expiresIn: expiry
          }, (err, token) => {
            if(err){
              //
              log('error creating token');
              reply(err.message);
            }
            else {
              // set cookie
              reply({
                data: '/chat'
              }).state('authentication', token);
            }
          });
        }, (error) => {
          // user is not registered
          reject(error.message);
          return reply(boom.unauthorized('unauthorized')).code(401);
        });
      }
    }
    //is authorized -> token refresh
    else {
      log('token refresh');
      jwt.sign({
        userID: request.auth.credentials.userID
      }, request.server.app.jwt_secret, {
        algorithm: 'HS256', expiresIn: expiry
      }, (err, token) => {
        if(err){
          //
          log('error refreshing token');
          reply(err.message);
        }
        else {
          // set cookie
          reply({
            data: 'successfully refreshed token'
          }).state('authentication', token).code(200);
        }
      });
    }
  }
};
