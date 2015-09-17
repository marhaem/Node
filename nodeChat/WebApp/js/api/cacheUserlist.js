/*jshint esnext:true */

import _ from 'lodash';

export let CacheUserlist = function () {
  this.list = {};
};

/**
 * objects = [{id, name, ...}]
 */
CacheUserlist.prototype.add = function add(objects) {
  var len = objects.length;
  var i = -1;
  var obj;

  while (++i < len) {
    obj = objects[i];
    this.list[obj.id] = obj;
    // i = 0: this.list['234324-23dfgfdg-324234-sdf-34234'] = {};
    // i = 1: this.list['134324-23dfgfdg-324234-sdf-34234'] = {};
  }
};

CacheUserlist.prototype.get = function get(id) {
  return this.list.hasOwnProperty(id) ? this.list[id] : null;
  //@TODO: Chat Api (NOT we here) has to fetch the id in case of null
};

CacheUserlist.prototype.getUnknown = function getUnknown(ids) {
  return _.difference(ids, _.keys(this.list));
};

/*
let list = {
  '234324-23dfgfdg-324234-sdf-34234': {
    id: '234324-23dfgfdg-324234-sdf-34234',
    name: 'Hans Doof'
  },
  '134324-23dfgfdg-324234-sdf-34234': {
    id: '134324-23dfgfdg-324234-sdf-34234',
    name: 'Hans Doof'
  },

};
*/
