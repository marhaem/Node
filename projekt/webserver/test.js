import test from './test/testModule';

test().then((Sequelize) => {
	return console.log('Seqeulize OK2');
}, (err) => {
	console.log('###ERROR: ' + err);
});