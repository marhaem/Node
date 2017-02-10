/*global Buffer*/
/**
 *
 */
export default function getHash(password, salt, cb) {
  if(!cb) {
    throw new Error('callback required');
  }
  // check if password is Buffer
  if(!Buffer.isBuffer(password)) {
    password = new Buffer(password.toString(), this.ENCODING);
  }
  this.crypto.pbkdf2(password, salt, 50000, 256, this.CIPHER, (error, key) => {
    if(error) {
      cb(error, null, null);
    }
    else {
      cb(undefined, key.toString(this.ENCODING));
    }
  });
}
