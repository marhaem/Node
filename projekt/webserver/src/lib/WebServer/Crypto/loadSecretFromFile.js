import fs from 'fs';
/**
 * cb from readFile takes two arguments (error, data)
 */
export default function loadSecretFromFile(fileName, cb) {
  if(!cb) {
    return fs.readFileSync(fileName, {encoding: this.ENCODING});
  }
  else {
    fs.readFile(fileName, {encoding: this.ENCODING}, cb);
  }
}
