import requests from './requests';

export default {
  //@TODO:170 rename to "getRoutes()"
  routes: function routes() {
    return requests.getRoutes();
  }
};
