/*global console*/
import jwt from 'jsonwebtoken';

const log = function log(info) {
  console.log(info);
};

export default function scheme(server, options) {
  return {
    authenticate: function(request, reply) {
      if(!request.headers.authorization) {
        log('no token');
        return reply(new Error('Unauthorized')).code(401);
      }
      else {
        //do something with req.headers.authorization
        jwt.verify(request.headers.authorization, server.app.jwt_secret, (err, decoded) => {
          if(err) {
            log('invalid token');
            return reply(new Error('Unauthorized')).code(401);
          }
          else {
            options.validateFunc(decoded, (err, id) => {
              if(err) {
                return reply(new Error('Unauthorized')).code(401);
              }
              else {
                log(id);
                return reply.continue({userID: id});
              }
            });
          }
        });
      }
    }
  };
}
