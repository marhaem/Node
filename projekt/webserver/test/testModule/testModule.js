//import Process from 'process';
import importSequelize from './import';

export default function test() {
	return new Promise((resolve, reject) => {
		return importSequelize().then((Sequelize) => {
			console.log('sequelize OK');
			return resolve(Sequelize);
		}, reject);
	});
}