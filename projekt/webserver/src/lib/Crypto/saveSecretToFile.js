/**
 * cb from writeFile takes an error argument.
 */
export default function saveSecretToFile(fileName, secret, cb) {
  if(!cb) {
    fs.writeFileSync(fileName, secret);
  }
  else {
    fs.writeFile(fileName, secret, cb); //asychronous
  }
}
