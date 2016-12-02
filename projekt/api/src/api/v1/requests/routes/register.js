import global from './Global';

let log = function log(info) {
  global.logger.info(info);
};

let reject = function reject(error) {
  global.logger.error(error);
};

export default {
  method: 'POST',
  config: {auth: false},
  path: '/api/v1/register',
  handler: function(request, reply) {
    if(!request.payload || !request.payload.email || !request.payload.password) {
      log('registering failed: no email or password given');
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
        log(result);
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
};
