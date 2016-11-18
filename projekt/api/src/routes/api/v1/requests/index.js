import global from '../../../../../Global';
import apiRoutes from './routes';

export default class Requests {
  constructor() {
    this.global = global;
  }

  /**
   * returns an Array with the api-routes
   */
  get() {
    //console.log(apiRoutes);
    return apiRoutes;
  }

  set(route) {
    apiRoutes.append(route);
  }


}
