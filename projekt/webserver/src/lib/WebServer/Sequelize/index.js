import importSequelize from './import.js';
import options from './options.js';
import global from '../Global.js';



export default function () {
  return new Promise((resolve, reject) => {
    return importSequelize().then((Sequelize) => {
      let sequelize = new Sequelize('Chat', 'derez', '12Test1234', options)
      return resolve(sequelize);
      }, reject()).catch(reject);
  });
}
