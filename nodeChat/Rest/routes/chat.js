/*global module */

import {v1} from './chat/v1';

export let chatRoute = {
  get: function(db) {
    return []
      .concat(v1.get(db));
  }
};