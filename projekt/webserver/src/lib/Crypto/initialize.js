/**
 *
 */
export default function initialize(cb) {
  if(!cb) {
    try {
      // @TODO: use helper methods to catch errors
      this.secret = fs.readFileSync(this.file, {encoding: 'utf8'});
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
        console.log(this.secret);
        fs.writeFileSync(this.file, this.secret, {encoding: 'utf8'});
        return this.secret;
      }
      catch(error) {
        global.logger.error('saving secret to file failed: ' + error);
        throw new Error(error);
        //@TODO throw error, would be necessary, server is not able to perform properly
      }
    }
  }
  else {
    fs.readFile(this.file, {encoding: 'utf8'}, (error, data) => {
      if(error) {
        global.logger.info('no secret found. Trying to create new secret\n');
        try {
          this.setBestAvailableCipher();
        }
        catch(err) { // give up
          cb(err);
        }
        this.secret = this.generateSecret();
        fs.writeFile(this.file, this.secret, {encoding: 'utf8'}, (error) => {
          if(error) {
            cb(error)
          }
          else {
            cb(null, this.secret);
          }
        });
      }
      else {
        this.secret = data;
      }
    });
  }
}
