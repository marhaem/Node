import requests from './requests';

export default {
  get: function get() {
    let routes = [];
    Array.prototype.push.apply(routes, requests.get(Array.prototype.slice.call(arguments)));
    return routes;
  }
};
