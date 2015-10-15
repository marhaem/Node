/*global module */

import {v1} from './chat/v1';

export let chatRoute = {
  get: function() {
    return []
      .concat(v1.get());
  }
};