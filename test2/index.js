import Sql from './lib/Sql/Sql.js';

function reject(err) {
	return console.log('###ERROR: ' + err);
}


(function () {
	return new Sql();
})();




/*
}, reject);
}, (err) => {return err;}).catch(reject); // geht nicht
*/

/*
import test from './src/testModule';


function reject(err) {
	console.log('###ERROR: ' + err);
}


test().then((Sequelize) => {
	let sequelize = new Sequelize('test', 'node', '0', options)
		.authenticate()
		.then(() => {
			console.log('wau was eim gute verbindung zung datenbankserver');
		}).catch(reject);
}, reject); //, (err) => {return err;}).catch(reject(err));*/