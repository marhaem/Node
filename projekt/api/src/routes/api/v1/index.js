import request from './request';

export default {
  get: function get() {
    let routes = [];
    Array.prototype.push.apply(routes, request.get(Array.prototype.slice.call(arguments)));
    return routes;
  }
};
