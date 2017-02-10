/*global console*/
/*jshint -W061*/
import sequelizeOptions from './config/options.json!';
import User from './User';
import Messages from './Messages';

function log(err) {
  console.log(err);
}

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
      if(column.references) { // resolve foreign key references
        column.references.model = eval('this.' + column.references.model);
      }
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
    this.sequelize = new Sequelize('Chat', 'derez', '12Test1234', sequelizeOptions);
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
    this.sequelize.sync(options).then(/*resolve*/(model) => {
      //log(model);
      return model;
    }, /*reject*/(err) => {
      log('an error occured: ' + err.message);
      return err;
    }); // sync all defined models to the DB  (nothing was defined though)
  }

  /**
   * Define tables.
   */
  initModels() {

    //let userModel = sequelize.import(path.join(process.cwd(), './src/lib/sql/Chat/User')); //oder ohne path.js: __dirname + './src/lib/sql/User'
    let user_TableDefinition = fixDatatypes(this.Sequelize, User.model);
    this.user = new User(this.sequelize.define(user_TableDefinition.name, user_TableDefinition.columns, user_TableDefinition.options || {}));
    let messages_TableDefinition = fixDatatypes(this.Sequelize, Messages.model);// needs this.user to be instantiated before
    this.messages = new Messages(this.sequelize.define(messages_TableDefinition.name, messages_TableDefinition.columns, messages_TableDefinition.options || {}));
    /**
     * returns a model
     */
    return {
      //retrieves the object with which the queries can be made
      User: this.user,
      Messages: this.messages
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

  testSequelize() {
    this.sequelize.authenticate().then(() => {
      log('sequelize OK');
      this.sequelize.sync().then(() => {
        log('sync was good');
      }, () => {});
    }, (err) => {
      log(err);
    });
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
//@TODO:20 DB-Credentials in Dateien auslagern
//console.log(path.join(process.cwd(), './src/lib/sql/User'));
//@TODO:250 das mit den relativen pfaden check ich nicht. woher weiss man welcher relative pfad richtig ist??

//sequelize.import(path.join(process.cwd(), './src/lib/sql/Chat/User')); //oder ohne path.js: __dirname + './src/lib/sql/User'
//return reply('user ' + request.payload.email).code(200);

//return sequelize;
