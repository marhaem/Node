/*global module */

import {v1} from './chat/v1';

export let chatRoute = {
  get: function(sequelize) {
    return []
      .concat(v1.get());
  }
};