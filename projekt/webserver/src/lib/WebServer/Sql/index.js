/*jshint -W061*/

import User from './User';


/**
 */
function fixDatatypes(Sequelize, model) {
  let columns = model.columns;
  let column;
  let i = 0;

  for (let key in columns) {
    if (columns.hasOwnProperty(key)) {
      column = columns[key];
      column.type = eval('Sequelize.' + column.type);
      i++;
    }
  }

  return model;
}


export default class Sql {
  /**
   * Define database connection.
   */
  constructor(Sequelize) {
    this.Sequelize = Sequelize;
    this.sequelize = new Sequelize('Chat', 'derez', '12Test1234', {
      dialect: 'mssql',
      host: 'localhost',
      server: 'localhost',
      port: 1433,
      dialectOptions: {
        instanceName: 'MSSQLSERVER'
      },
      pool: {
        max: 5,
        min: 1,
        idle: 10000
      }
    });
  }

  /**
   * Open database connection.
   * Make sure all tables exist, create if not.
   * Ready for use.
   *
   * Note:
   * Connection might be closed / opened per sql command.
   */
  connect(options) {
    return this.sequelize.sync(options);
  }

  /**
   * Define tables.
   */
  initModels() {

    //let userModel = sequelize.import(path.join(process.cwd(), './src/lib/sql/Chat/User')); //oder ohne path.js: __dirname + './src/lib/sql/User'
    let userModel = fixDatatypes(this.Sequelize, User.model);
    /**
     * returns a model
     */
    return {
      User: new User(this.sequelize.define(userModel.name, userModel.columns, userModel.options || {}))
      /*User: new User(this.sequelize.define(userModel.name, {
        "userID": {
          "type": Sequelize.INTEGER,
          "primaryKey": true,
          "autoIncrement": true
        },
        "email": {
          "type": Sequelize.STRING,
          "validate": {
            "notNull": true,
            "unique": true,
            "isEmail": {
              "msg": "not a valid E-Mail-address"
            }
          }
        },
        "firstName": {
          "type": Sequelize.STRING
        },
        "lastName": {
          "type": Sequelize.STRING
        },
        "passwordHash": {
          "type": Sequelize.STRING
        },
        "passwordSalt": {
          "type": Sequelize.STRING
        }
      }, userModel.options || {}))*/
    };
  }
}

/*
  let reject = function reject(err) {
    if(err)
    {
      global.default.logger.error(err + 'exiting');
      return {};
    }
  };
/*

  let userModel = sequelize.import(path.join(process.cwd(), './src/lib/sql/Chat/User')); //oder ohne path.js: __dirname + './src/lib/sql/User'
*/
//@TODO:0 DB-Credentials in Dateien auslagern
//console.log(path.join(process.cwd(), './src/lib/sql/User'));
//@TODO:10 das mit den relativen pfaden check ich nicht. woher weiss man welcher relative pfad richtig ist??

//sequelize.import(path.join(process.cwd(), './src/lib/sql/Chat/User')); //oder ohne path.js: __dirname + './src/lib/sql/User'
//return reply('user ' + request.payload.email).code(200);

//return sequelize;
