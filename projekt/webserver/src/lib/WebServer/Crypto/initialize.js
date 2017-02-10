/*global*/
import fs from 'fs';
import global from '../../Global';
/**
 *
 */
//@TODO:40 Why the fuck isn't this.global defined??? It works with Requests.login though -_-
/*let log = function log(info) {
  this.global.logger.info(info);
};*/

function log(info) {
  global.logger.info(info);
}

function reject(error) {
  global.logger.error(error);
}

export default function initialize(cb) {
    if(!cb) {
    try {
      //@TODO:210 use helper methods to catch errors
      this.secret = fs.readFileSync(this.file, {encoding: this.ENCODING});
    }
    catch(error) {
      reject('loading secret from file failed: ' + error);
      try {
        this.setBestAvailableCipher();
      }
      catch(error) {
        reject(error);
        throw new Error(error);
        //@TODO:190 throw error, would be necessary, server is not able to perform properly
      }
      try {
        this.secret = this.generateSecret();
        log(this.secret);
        fs.writeFileSync(this.file, this.secret, {encoding: this.ENCODING});
        return this.secret;
      }
      catch(error) {
        reject('saving secret to file failed: ' + error);
        throw new Error(error);
        //@TODO:200 throw error, would be necessary, server is not able to perform properly
      }
    }
  }
  else {
    fs.readFile(this.file, {encoding: this.ENCODING}, (error, data) => {
      if(error) {
        log('no secret found. Trying to create new secret\n');
        try {
          this.setBestAvailableCipher();
        }
        catch(err) { // give up
          reject(err);
          cb(err);
        }
        this.secret = this.generateSecret();
        log('successfully generated secret');
        fs.writeFile(this.file, this.secret, {encoding: this.ENCODING}, (error) => {
          if(error) {
            cb(error);
          }
          else {
            log('successfully wrote secret to file');
            cb(null, this.secret);
          }
        });
      }
      else {
        log('successfully retrieved secret from file');
        this.secret = data;
        cb(null, data);
      }
    });
  }
}
