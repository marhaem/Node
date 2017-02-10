/*global console*/
import boom from 'boom';
import global from './Global';

const l = (a) => {
  console.log(a);
};

const reject = (error) => {
  global.logger.error(error);
};

//@TODO: remove whitespace at end or beginning of a message
//@TODO: check timestamp of the message ts <= now. But it should also not be possible, to send messages that are older than messages sent in the past
/*
 *
 *
 */
export default {
  method: 'POST',
  config: {
    auth: 'jwt',
    payload: {
      defaultContentType: 'application/json',
      allow: ['application/json', 'application/x-www-form-urlencoded']
    }
  },
  path: '/api/v1/sendMessage',
  handler: function(request, reply) {
    l('sendMessage#request incoming: ' + JSON.stringify(request.payload));
    l('sendMessage#userID: ' + JSON.stringify(request.payload.userID));
    l('sendMessage#request incoming: ' + JSON.stringify(request.payload.message));
    if(request.auth.credentials === 'unauthorized') {
      l('unauthorized request');
      reply(boom.unauthorized('Unauthorized', 'jwt')).code(401);
    }
    else if(!request.payload || !request.payload.userID || !request.payload.message) {//if one of these is null
      l('malformed request');
      reply(boom.badRequest('no recipient or message specified')).code(400);
    }
    else {
      l(request.auth.credentials);
      //save message in DB
      l('message incoming: ' + request.payload.message + ' from: ' + request.auth.credentials.userID + ' chatID: ' + request.payload.chatID);
      global.models.Messages.send({
        chatID: request.payload.chatID,
        sentFromUserID: request.auth.credentials.userID,
        message: request.payload.message
      }).then((message) => {
        reply(message).code(200);
      }, (err) => {
        reply({
          data: err.message
        }).code(400);
      });
    }
  }
};
