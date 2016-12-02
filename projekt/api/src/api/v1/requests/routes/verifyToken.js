import jwt from 'jsonwebtoken';

function log(info) {
  console.log(info);
}

export default {
  method: 'POST',
  path: '/api/v1/verifyToken',
  config: {auth: false},
  handler: function(request, reply) {
    log(request.headers);
    if(!request.headers.authorization) {
      reply({
        error: 'true',
        message: 'Bad Request'
      })
      .code(400);
    }
    else{
      try {
        let decoded = jwt.verify(request.headers.authorization, request.server.app.jwt_secret);
        reply(decoded)
        .code(200);
      }
      catch(error) {
        reply()
        .code(401);
      }
    }
  }
};
