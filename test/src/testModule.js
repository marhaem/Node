import importSequelize from './import.js';
//import options from './config/options.json!';
import Process from 'process';

// sequelize.close() is not returning from some Bluebird Promise, which spams the shell
//Process.env.BLUEBIRD_WARNINGS = 0;

// jspm install npm:pg -o "{map: {'./lib': './lib/index.js', './lib/native': '@empty'}, deps: ['npm:pg-types']}"
// jspm install npm:sequelize -o "{map: {'./lib/associations': './lib/associations/index.js', './lib/dialects/abstract': './lib/dialects/abstract/index.js', './lib/dialects/mariadb': './lib/dialects/mariadb/index.js', './lib/dialects/mssql': './lib/dialects/mssql/index.js', './lib/dialects/mysql': './lib/dialects/mysql/index.js', './lib/dialects/postgres': './lib/dialects/postgres/index.js', './lib/dialects/sqlite': './lib/dialects/sqlite/index.js', 'mysql': '@empty'}}"
//import Sequelize from 'sequelize';


function expandOptions(options) {
	options = options || {};

	options.host = options.host || 'localhost';
	options.port = options.port || Process.env.PGPORT || 5432;
	options.database = options.database || Process.env.PGDATABASE;

	if (options.dialect === 'postgres') {
		options.dialectModulePath = 'pg';
	}

	options.native = false;

	return options;
}



export default function test() {
	/*return new Promise((resolve, reject) => {
		return importSequelize().then((Sequelize) => {
			let sequelize = new Sequelize('test', 'node', '12Test1234', options)
			.authenticate()
			.then(() => {
				console.log('wau was eim gute verbindung zung datenbankserver');
				return resolve(Sequelize);
			}).catch(reject);
		}, reject);
	});*/
	/*return new Promise((resolve, reject) => {
		// load options
		return System.import('/config/options.json!').then((options) => {
			//console.log(options);

			// expand options by defaults
			options = expandOptions(options);

			// read user/pass from env or set default
			Process.env.PGUSER = Process.env.PGUSER || 'node';
            Process.env.PGPASSWORD = Process.env.PGPASSWORD || '12Test1234';
			console.log(options);
			// initialize a sequelize instance
			let sequelize = new Sequelize(options);
			
			// try it out
			sequelize.authenticate().then(() => {
				console.log('sequelize OK');
				return resolve(Sequelize);
			}, reject).catch(reject);
		}, reject).catch(reject);
	});*/
	
	return new Promise((resolve, reject) => {
		return System.import('config/options.json!').then((options) => {

			return importSequelize().then((Sequelize)  => {
				//options = expandOptions(options);

				//Process.env.PGUSER = Process.env.PGUSER || 'derez';
				//Process.env.PGPASSWORD = Process.env.PGPASSWORD || '12Test1234';

				let sequelize = new Sequelize('Chat', 'derez','12Test1234', options);

				sequelize.authenticate().then(() => {
					console.log('sequelize OK');
					return resolve(Sequelize);
				}, reject).catch(reject);
			}, reject).catch(reject);
		}, reject).catch(reject);
	});
}


/*
}, (err) => {return err;}).catch(reject(err)); // geht überhaupt nicht "err undefined"
*/
/*
}, (err) => {return err;}).catch(reject);
*/

/*

hier entweder:
}, (err) => {return err;}).catch(reject);
oder
}, reject);
 */