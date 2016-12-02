function scheme(server, options) {
	return {
		authenticate: function authenticate(request, reply) {
			if(!req.headers.authorization) {
				return reply{
					error: true,
					message: 'Unauthorized'
				};
			}
			else {
				//do something with req.headers.authorization
				return reply.continue('success');
			}
		},
		payload: '',
		response: ''
}
server.auth.scheme('name', scheme)

/*let path = './src/lib/Crypto/methods/index.js';
//let start = require(path);
let System = require('jspm').Loader();

function reject(info) {
	console.log(info)
}

// so that we may enter jspm in index.js
System.import(path).then((start) => {
	start.default.get();
}, reject).catch(reject);*/

/*let path = './test/testClass/module';
let System = require('jspm').Loader();

let reject = function reject(error) {
	console.log('###ERROR: ' + error);
};

System.import(path).then( (Test) => {
	Test = Test.default;
	let test = new Test();
	console.log(test.get());
	console.log('success');
}, reject).catch(reject);
*/

/*
let path = './test/testClass/module';
import Test from './test/testClass/module';

let reject = function reject(error) {
	console.log('###ERROR: ' + error);
};

let test = new Test();
console.log(test.get());
*/