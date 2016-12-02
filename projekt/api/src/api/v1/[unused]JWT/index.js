/*global server, console*/
import jwt from 'jsonwebtoken';

export default {
  getToken: function getToken(payload, secret) {
    return jwt.sign(payload, secret, {expiresIn: 3600});
  },
  verify: function verify(token) {
    try {
      jwt.verify(token, server.app.jwt_secret);
    }
    catch(error) {
      console.log('someone used an invalid token: ' + token + '\n');
    }
  }
};
