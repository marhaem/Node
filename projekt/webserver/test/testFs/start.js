import Module from './testfs';

let module = new Module("./secret.txt");

module.initialize(cb2);

debug('1');

function cb2(data) {
	debug(data);
}

function cb(error, data) { // method 2
	if(error) {
		debug(err);
	}
	else {
		debug(data);
	}
}


function debug(a) {
	console.log(a);
}