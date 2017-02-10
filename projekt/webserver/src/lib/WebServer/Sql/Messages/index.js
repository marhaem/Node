import model from './TableDefinitions/model.json!';
//import receive from './receive';
import send from './send';

export default class Messages{
  constructor(sqlTable) {
    this.sqlTable = sqlTable;
    // class methods
    this.send = send;
    //this.receive = receive;
  }

  static get model() {
    return model;
  }

  static set model(model) {
    model = model;
  }

}
