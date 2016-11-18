/**
 *
 */
export default function slowEquals(a, b, cb) {
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
