/*global Buffer*/
'use strict';

import global from '../Global';
import fs from 'fs';

export default class Crypto{
  constructor() {
    this.crypto = global.crypto;

    this.goodCiphers = ['aes-256-cbc-hmac-sha1', 'aes-256-cbc'];
    this.availableCiphers = this.crypto.getCiphers();
    this.CIPHER = undefined;

    this.goodHashAlgoritms = ['sha512WithRSAEncryption', 'rsa-sha512', 'sha512', 'sha256WithRSAEncryption', 'rsa-sha256', 'sha256'];
    this.avaiableHashAlgorithms = this.crypto.getHashes();
    this.HASH_ALGORITHM = undefined;

    this.secret = undefined;
    this.file = '../../../../secret';
  }

  /**
   *
   */
  setBestAvailableCipher() {
    for(let cipher in this.goodCiphers) {
      if(this.availableCiphers.indexOf(this.goodCiphers[cipher]) !== -1) {
        this.CIPHER = this.goodCiphers[cipher];
      }
    }
    if(!this.CIPHER) {
      throw new Error('No good cipher found');
    }
  }

  /**
   *
   */
  setBestAvailableHashAlgorithm() {
    for(let hash in this.goodHashAlgorithms) {
      if(this.avaiableHashAlgorithms.indexOf(this.goodHashAlgorithms[hash]) !== -1) {
        this.HASH_ALGORITHM = this.goodHashAlgorithms[hash];
      }
    }
    if(!this.HASH_ALGORITHM) {
      throw new Error('No good hash algorithm found');
    }
  }

  /**
   * returns Buffer
   */
  generateSecret() {
    if(!this.CIPHER) {
      throw new Error('no cipher defined');
    }
    else {
      let cipher = this.crypto.createCipher(this.CIPHER, this.crypto.randomBytes(256));
      return cipher.update(
        new Buffer(global.crypto.randomBytes(256),
        null,
        'base64'
      )).toString() + cipher.final('base64').toString();
    }
  }

  /**
   * cb from writeFile takes an error argument.
   */
  saveSecretToFile(fileName, secret, cb) {
    if(!cb) {
      fs.writeFileSync(fileName, secret);
    }
    else {
      fs.writeFile(fileName, secret, cb);
    }
  }

  /**
   * cb from readFile takes two arguments (error, data)
   */
  loadSecretFromFile(fileName, cb) {
    if(!cb) {
      fs.readFileSync(fileName).toString();
    }
    else {
      fs.readFile(fileName, cb);
    }
  }

  generateSalt() {
    return this.crypto.randomBytes(256/8).toString('utf8');
  }

  getHash(password, salt, cb) {
    if(!cb){
      throw new Error('callback required');
    }
    else {
      this.crypto.pbkdf2(password, salt, 50000, 256, this.CIPHER, (error, key) => {
        if(error) {
          cb(error, null, null);
        }
        else {
          cb(undefined, key.toString('utf8'));
        }
      });
    }
  }

  /**
   *
   */
  slowEquals(a, b, cb) {
    if(!cb) {
      throw new Error('callback missing');
    }
    else if(!a) {
      cb(new Error('`a` missing'));
    }
    else if(typeof a !== 'string') {
      cb(new Error('`a` must be a string'));
    }
    else if(!b) {
      cb(new Error('`b` missing'));
    }
    else if(typeof b !== 'string') {
      cb(new Error('`a` must be a string'));
    }
    else {
      let lengthA = a.length;
      let lengthB = b.length;
      let i = lengthA < lengthB ? lengthA : lengthB;

      let diff = lengthA ^ lengthB;

      while(i--) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
      }
      cb(null, diff === 0);
    }
  }

  /**
   *
   */
  validate(password, userSalt, userHash, cb) {
    if(!cb) {
      throw new Error('callback required');
    }
    this.getHash(password, userSalt, (error, newHash) => {
      if(error) {
        global.logger.error(error);
        cb(new Error('user authentication failed'));
      }
      else {
        this.slowEquals(userHash, newHash, (error, isEqual) => {
          if(error) {
            global.logger.error(error);
            cb(new Error('user authentication failed'));
          }
            cb(null, isEqual);
        });
      }
    });
  }

  /**
   *
   */
  initialize(cb) {
    if(!cb) {
      try {
        this.loadSecretFromFile(this.file);
      }
      catch(error) {
        global.logger.error('loading secret from file failed: ' + error);
        try {
          this.setBestAvailableCipher();
        }
        catch(error) {
          global.logger(error);
          throw new Error(error);
          //@TODO throw error, would be necessary, server is not able to perform properly
        }
        try {
          this.secret = this.generateSecret();
          this.saveSecretToFile(this.file, this.secret);
        }
        catch(error) {
          global.logger.error('saving secret to file failed: ' + error);
          throw new Error(error);
          //@TODO throw error, would be necessary, server is not able to perform properly
        }
      }
    }
    else {
      this.loadSecretFromFile(this.file, (error, data) => {
        if(error) {
          cb('loading secret from file failed: ', error);
          try {
            this.setBestAvailableCipher();
          }
          catch(err) {
            throw err;
          }
          this.secret = this.generateSecret();
          this.saveSecretToFile(
            this.file,
            this.secret,
            cb('saving secret to file failed: ', error)
          );
        }
        else {
          this.secret = data;
          this.saveSecretToFile(this.file, this.secret, cb('saving secret to file failed: ', error));
        }
      });
    }
  }
}
