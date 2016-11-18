import fs from 'fs';

export default class Crypto {
	constructor(file) {
		this.file = file;
		this.secret = undefined;
	}

	
	loadSecretFromFile(cb) {
		if(!cb) { // synchronous
			return fs.readFileSync(this.file).toString();
		}
		else {
			fs.readFile(this.file, cb);
		}
	}
	
	debug(msg) {
		console.log(msg);
	}
	
	initialize(cb) {
		// synchronous
		if(!cb) {
			try {
				this.secret = fs.readFileSync(this.file).toString();
				this.debug('success. Data:\n' + this.secret);
			}
			catch(err) {
				this.debug('loading secret from file failed.\n' + err);
			}
			try {
				fs.writeFileSync(this.file, this.secret);
			}
			catch(err) {
				this.debug('writing secret to file failed.\n' + err);
			}
			this.debug('successfully written secret to file');
		}
		// asynchronous
		else {
			fs.readFile(this.file, (err, data) => { // 1: cb by proxy -//- 2: direct call of cb
				if(err) {
					cb('async reading secret from file failed.\n' + err);
				}
				else {
					fs.writeFile('./secret2.txt', data, (err) => {
						if(err) {
							cb(err);
						}
						else {
							cb('async writing succeeded. Data written:\n' + data);
						}
					});
				}
			});
			this.debug('2');
		}
	}
}