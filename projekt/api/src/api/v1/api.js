import requests from './requests';

export default {
  //@TODO: rename to getRoutes()
  routes: function routes() {
    return requests.getRoutes();
  }
};
