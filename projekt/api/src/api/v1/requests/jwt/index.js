import jwt from 'jasonwebtoken';
import global from './Global';
import Crypto from './Crypto';

function reject(error) {
  global.logger.error(error);
}

function log(info) {
  console.log(info);
}

export default class JWT {
  constructor() {
    this.expiry = 3600; //seconds
    //@TODO: create secret and define getter method bc its needed in WebServer/index too
    let crypto = new Crypto('./jwt_secret.js');
    crypto.initialize((error, secret) => {
      if(error) {
        reject(error);
      }
      else {
        this.secret = secret;
        log('retrieved secret for jwt');
      }
    });
  }

  getToken(payload) {
    console.log('signing token');
    //default algorithm is HS256
    return jwt.sign(payload, this.secret, {expiresIn: this.expiry});
  }

  verify(token) {
    try {
      jwt.verify(token, this.secret);
    }
    catch(error) {
      reject('someone used an invalid token: ' + token + '\n');
    }
  }

  getSecret() {
    return this.secret;
  }
}
