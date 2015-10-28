import {send} from './v1/send';

export let v1 = {
  get: function () {
    return []
      .concat(send.get());
  }
};
