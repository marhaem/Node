/*global console*/
import global from './Global';

let log = function log(info) {
  console.log(info);
};

let reject = function reject(error) {
  global.logger.error(error);
};

export default {
  method: 'POST',
  path: '/api/v1/unlockUser',
  handler: function(request, reply) {
    log(request.payload.email);
    if(!request.payload || !request.payload.email) {
      reply('mach 1 boom jonge').code(400);
    }
    else {
      global.models.User.unlockUser(request.payload.email).then( (user) => {
        log('unlocked account for' + user.email);
        reply('unlocked account for' + user.email).code(200);
      }, (error) => {
        reject(error.message);
        reply('mach 1 boom jonge').code(401);
      });
    }
  }
};
