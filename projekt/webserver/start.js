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

var val = (function() {
	console.log(42);
})();

/*
let path = './test/testClass/module';
import Test from './test/testClass/module';

let reject = function reject(error) {
	console.log('###ERROR: ' + error);
};

let test = new Test();
console.log(test.get());
*/