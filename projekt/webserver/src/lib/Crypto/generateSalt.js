/**
 *
 */
export default function generateSalt() {
  return this.crypto.randomBytes(256/8).toString('utf8');
}
