import jwt from 'jsonwebtoken';
import crypto from'crypto';

import global from '../../../../../../Global';

let log = function reject(info) {
  global.logger.info(info);
};

let reject = function reject(error) {
  global.logger.error(error);
};

export default class JWT{
  constructor() {
    this.sessions = [];
    //@TODO: generate a secret using crypto
    this.secret = undefined;

    this.exp = 1000 * 60 * 60;
  }

  getToken(session) {
    log('signing token');
    return jwt.sign(session, this.secret, {algorithm: 'HSA256', expiresIn: this.exp, notBefore: 1000 * 10, iat: new Date().getTime()});
  }

  verify(token) {
    try {
      jwt.verify(token, this.secret);
    }
    catch(error) {
      reject('someone used an invalid token: ' + token + '\n');
    }

  }


}
