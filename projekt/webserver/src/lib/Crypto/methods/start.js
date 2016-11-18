import fs from 'fs';
import System from 'jspm';
System = System.Loader();

let log = function log(info) {
	console.log(info);
}

function a(module) {
	module = module.default;
	log(module);
}

let modules = {};

let files = fs.readdirSync(process.cwd());
let exp = files.forEach((file) => {
	if(file.split('.')[1] === 'js') { // only import javascript-files
		file = './' + file;
		System.import(file).then(a, log).catch(log);
	}
});
log(files);