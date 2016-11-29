/*global console, System, __moduleName*/

//import fs from 'fs';
import methods from './methods';

let log = function log(info) {
	console.log('index.js: ');
	console.log(info);
};

function a(method) {
	System.import('./' + method, __moduleName).then((imp) => {
		//imp.default.get(); // GEHT
		return imp.default;
		//log(ret.method);
		//ret[method] = imp;
	}, log).catch(log);

}

let ret = {};

export default {
	get: function get() {
		return new Promise((resolve, reject) => {
			let ret = {};
			let i, length = methods.length;
			for(i=0; i < length; i++) {
				let b = a(methods[i]);
				ret[methods[i]] = b;
			}
			if(ret === {})
			{
				reject(new Error('failed loading methods'));
			}
			else {
				resolve(ret);
			}
		});

		/*methods.forEach((method) => {
			System.import('./' + method, __moduleName).then((imp) => {
				//imp.default.get(); // GEHT
				ret[method] = imp.default;
				//log(ret.method);
				//ret[method] = imp;
			}, log).catch(log);
		});*/

		/*let files = fs.readdirSync(process.cwd() + '/src/lib/Crypto/methods');
		files.forEach((file) => {
			if(file.indexOf('file') !== -1) { // only import javascript-files
				//log(file);
				file = './src/lib/Crypto/methods/' + file;
				System.import(file).then(a, log).catch(log);
			}
		});*/
	},
	cwd: function cwd() {
		log('###: ' + __moduleName);
	}
}
