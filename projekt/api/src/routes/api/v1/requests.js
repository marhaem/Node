/*global*/
import Requests from './requests/index';

export default {
  get: function get() {
    return new Requests().get();
  }
};
