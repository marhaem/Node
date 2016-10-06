import model from './TableDefinitions/model.json!';
import register from './register';
import login from './login';
import global from '../../Global';
import Crypto from '../Crypto';

/**
 */
export default class User {
  /**
   */
  static get model() {
    return model;
  }

  /**
   */
  static set model(model) {
    model = model;
  }

  /**
   */
  constructor(sqlTable) {
    this.sqlTable = sqlTable;
    this.global = global;
    this.crypto = new Crypto();
    this.crypto.initialize((msg, error) => {
      global.logger.error(msg + error);
    });

  // class methods
    this.register = register;
    this.login = login;
  }
}
