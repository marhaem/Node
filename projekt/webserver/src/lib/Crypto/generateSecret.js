/*global Buffer*/
/**
 * returns Buffer
 */
export default function generateSecret() {
  if(!this.CIPHER) {
    throw new Error('no cipher defined');
  }
  else {
    let cipher = this.crypto.createCipher(this.CIPHER, this.crypto.randomBytes(256));
    let ret = cipher.update(
      new Buffer(this.crypto.randomBytes(256),
      null,
      'utf8'
    )).toString() + cipher.final('utf8').toString();
    return ret;
  }
}
