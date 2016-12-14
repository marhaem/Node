/*global console*/

function log(info) {
  console.log(info);
}

export default {
  method: 'POST',
  path: '/api/v1/verifyToken',
  config: {auth: 'jwt'},
  handler: function(request, reply) {
    if(!request.auth) {
      reply({
        error: 'true',
        message: 'Bad Request'
      })
      .code(400);
    }
    else{
      reply({userID: request.auth.userID})
      .code(200);
    }
  }
};
