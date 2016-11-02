/*global console*/
import moment from 'moment';
import global from '../../../../../webserver/src/lib/WebServer/Global';

let reject = function reject(err) {
  if(err) {
    global.logger.error('request.js: ' + err);
  }
};

export default {
  get: function get() {
    return [{
      method: 'POST',
      path: '/api/v1/ping',
      handler: function(request, reply) {
        if(!request.payload || !request.payload.date) {
          request.log.info('request failed: date missing');
          return reply({
            error: 'date missing'
          })
          .code(400);
        }
        else {
          request.log.info('succesfully answered user ping request');
          return reply({
            data: moment().diff(moment(request.payload.date), 'milliseconds', false)
          })
          .code(200);
        }
      }
    }, {
      method: 'POST',
      path: '/api/v1/register',
      handler: function(request, reply) {
        if(!request.payload || !request.payload.email || !request.payload.password) {
          request.log.info('registering user failed: no email or password given');
          return reply({
            error: 'no email or password given'
          })
          .code(400);
        }
        else {
          global.models.User.register({
            "email": request.payload.email,
            "firstName": request.payload.firstName,
            "lastName": request.payload.lastName,
            "passwordHash": request.payload.password
          })
          .then((result) => {
            global.logger.info(result);
            reply({
              data: result
            })
            .code(200);
          }, (error) => {
            reject(error);
            reply({
              data: error
            })
            .code(400);
          });
        }
      }
    }, {
      method: 'POST',
      path: '/api/v1/login',
      handler: function(request, reply) {
        if(!request.payload || !request.payload.email || !request.payload.password) {
          request.log.info('login user failed: no email or password given');
          return reply({
            data: 'no email or password given'
          })
          .code(418);
        }
        else {
          global.models.User.login({
            "email": request.payload.email,
            "password": request.payload.password
          }).then((val) => {
            console.log(val);
            //console.log('request: ' + request);
            //console.log('reply: ' + reply);
            //return reply.redirect('/chat').code(302);
            //return reply.redirect('/chat').send();

            //request.setUrl('http://localhost:3000/chat');
            return reply({
              data: '/chat'
            }).code(302);// will enter .fail in jquery -_-, meh.
          }, (error) => {
            //@TODO: implement correct http-status-codes. wrong credentials: 401, user locked: do not differentiate or else existence of users could be hacked
            //http://stackoverflow.com/questions/1959947/whats-an-appropriate-http-status-code-to-return-by-a-rest-api-service-for-a-val
            console.log(error);
            reject(error);
            reply({
              data: error
            }).code(401);
          });
        }
      }
    }];
  }
};
