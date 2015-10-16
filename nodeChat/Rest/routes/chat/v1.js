import {send} from './v1/send';

export let v1 = {
  get: function (db) {
    return []
      .concat(send.get(db));
  }
};
