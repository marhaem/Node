/*
// module.exports kann mit require('modul/file'); importiert werden
module.exports = {
	start: process.cwd()
}
*/

let path = require('path');
let fs = require('fs');
let dir = 'C:\\Users\\marhaem\\music';

let tree = listFilesRecursive(dir, (err, files) => {
	if(err) {
		debug(err);
	}
	else {
		let i, l = files.length;
		
		for(i=0; i<l; i++) {
			debug(files[i]);
		}
	}
});

debug('done2');

function listFilesRecursive(dir, cb) {
	if(!cb) {
		//async
		let ret = [];

		let paths = fs.readdirSync(dir);

		let i, l = paths.length;
		for(i=0; i<l; i++) {
			let stats = fs.statSync(path.join(dir, paths[i]));

			if(stats.isDirectory()) {
				listFilesRecursive(path.join(dir, paths[i])).map((file) => {
					ret.push(file);
				});
			}
			else if(stats.isFile()) {
				ret.push(path.join(dir, paths[i]));
			}
			else {
				console.log('neither a directory nor a file: ' + paths[i]);
			}
		}
		return ret;
	}
	else {
		//sync
		fs.readdir(dir, (err, paths) => {
			if(err) {
				cb(err);
			}
			else {
				let ret = paths.map((file) => { // returns a new Array
					return path.join(dir, file);
				}).forEach((file) => { // returns same array with processed elements
					let stats = fs.statSync(file);
					
					if(stats.isDirectory()) {
						return listFilesRecursive(file);//get an Array of all files recursively
					}
					else {
						return file; //push file on Array
					}
				});
				
				if(ret)
				{
					cb(null, ret);
				}
				else {
					debug('fail');
				}
			}
		});
	}
};


function listFilesRecursiveSync(dir) {
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
};
	

function debug(a){
	console.log(a);
};