/*jslint -W061*/
//@TODO: fix is not used, since I couldn't find out how to make it work with MSSQL using tedious

import importSequelize from './import';
import options from './options.json!';
import global from '../../Global'

function fixDatatypes(model, Sequelize) {
  let columns = model.columns; // object is modified by reference
  let column;

  for(let key in columns) {
    if(columns.hasOwnProperty(key)) {
      column = columns[key];
      column.type = eval('Sequelize.' + column.type);
    }
  }
  return model;
}


export default function test() {
  return new Promise((resolve, reject) => {
    return importSequelize().then((Sequelize) => {
      let sequelize = new Sequelize('Chat', 'derez', '12Test1234', options);
      sequelize.authenticate().then(() => {
        return resolve(Sequelize);
      }, reject).catch(reject);
    }, reject).catch(reject);
  });
}
