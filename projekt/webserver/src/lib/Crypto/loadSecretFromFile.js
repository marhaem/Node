/**
 * cb from readFile takes two arguments (error, data)
 */
export default function loadSecretFromFile(fileName, cb) {
  if(!cb) {
    return fs.readFileSync(fileName, {encoding: 'utf8'});
  }
  else {
    fs.readFile(fileName, {encoding: 'utf8'}, cb);
  }
}
