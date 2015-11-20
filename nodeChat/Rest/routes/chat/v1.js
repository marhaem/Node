import {send} from './v1/send';
import {fetch} from './v1/fetch';
import {get} from './v1/get';

export let v1 = {
  get: function () {
    return []
      .concat(send.get())
      .concat(fetch.get())
      .concat(get.get());
  }
};
