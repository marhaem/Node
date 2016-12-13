/**
 *
 */
export default function validate(password, userSalt, userHash, cb) {
  if(!cb) {
    throw new Error('callback required');
  }
  this.getHash(password, userSalt, (error, newHash) => {
    if(error) {
      this.logger.error(error);
      cb(new Error('user authentication failed'));
    }
    else {
      this.slowEquals(userHash, newHash, (error, isEqual) => {
        if(error) {
          this.logger.error(error);
          cb(new Error('user authentication failed'));
        }
          cb(null, isEqual);
      });
    }
  });
}
