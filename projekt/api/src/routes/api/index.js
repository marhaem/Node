import v1 from './v1';

export default {
  get: function get() {
    let routes = [];
    Array.prototype.push.apply(routes, v1.get(Array.prototype.slice.call(arguments)));
    return routes;
  }
};
