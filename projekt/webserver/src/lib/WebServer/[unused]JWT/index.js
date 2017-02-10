import jwt from 'jsonwebtoken';
import Crypto from '../../Crypto';
import global from '../../Global';

//@TODO:180 retrieve secret from Process.env, Crypto or create another one

let log = function log(info) {
  global.logger.info(info);
};

let reject = function reject(error) {
  global.logger.error(error);
};

export default class JWT{
  constructor() {
    this.sessions = [];
    this.secret = undefined;
    this.exp = 1000 * 60 * 60;
    this.crypto = new Crypto('./secret.txt');
    this.crypto.initialize((error, secret) =>{
      if(error) {
        reject(error);
        throw error;
      }
      else {
        log('successfully retrieved secret for JWT');
        this.secret = secret;
      }
    });
  }

  getToken(session) {
    console.log('signing token');
    return jwt.sign(session, this.secret, {algorithm: 'HSA256', expiresIn: this.exp, notBefore: 1000 * 10, iat: new Date().getTime()});
  }

  verify(token) {
    try {
      jwt.verify(token, this.secret);
    }
    catch(error) {
      global.logger.error('someone used an invalid token: ' + token + '\n');
    }

  }


}
