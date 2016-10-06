let Crypto = require('crypto');
let fs = require('fs');

let pass = 'wrgoj4'//Crypto.randomBytes(256).toString('utf8');
let cipher = Crypto.createCipher('aes-256-cbc', pass);
let update = cipher.update('some text ', null, 'base64').toString() + cipher.update('some more text', null, 'base64').toString();

let final = cipher.final('base64').toString();

writeFile('C:\\Users\\marhaem\\Documents\\###Meine Aufgaben\\git\\Node\\projekt\\webserver\\secret.txt',
	update + final);

console.log('update: ' + update);
console.log('final: ' + final);

let secret = readFile('C:\\Users\\marhaem\\Documents\\###Meine Aufgaben\\git\\Node\\projekt\\webserver\\secret.txt');

let decipher = Crypto.createDecipher('aes-256-cbc', pass);
let dec = decipher.update(secret, 'base64', 'utf8').toString();
let decfinal = decipher.final('utf8').toString();

console.log('decipher: ' + dec + '\n' + decfinal);

Crypto.pbkdf2('secret', 'salt', 50000, 256, 'sha512WithRSAEncryption', (err, key) => {
	if(err) {
		console.log('an error occured');
	}
	else if(key) {
		console.log('salt: ' + key.toString('base64'));
	}
});

Crypto.pbkdf2('secret', 'salt', 100000, 512, 'sha512', (err, key) => {
  if (err) throw err;
  console.log(key.toString('hex'));  // 'c5e478d...1469e50'
});

function writeFile(file, text) {
	fs.writeFileSync(file, text);
}

function readFile(file) {
	return fs.readFileSync(file).toString();
}