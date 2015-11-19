import {send} from './v1/send';
import {fetch} from './v1/fetch';

export let v1 = {
  get: function () {
    return []
      .concat(send.get())
      .concat(fetch.get());
  }
};
