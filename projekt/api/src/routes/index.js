import api from './api';

export default {
  get: function get() {
    let routes = [];
    Array.prototype.push.apply(routes, api.get(Array.prototype.slice.call(arguments)));
    return routes;
  }
};
