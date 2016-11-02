import importSequelize from '../../src/testModule.js';

function reject(err) {
	console.log(err);
}

export default class Sql {
	constructor() {
		importSequelize().then(() => {
			console.log('Sequelize OK');
		}, reject).catch(reject);
	}
}