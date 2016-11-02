//import Process from 'process';

export default function _import() {
	Process.env.BLUEBIRD_WARNINGS = 0;
	return System.import('sequelize');//.then((Seqeulize) => {return Sequelize;}, (err) => {return err;});
}