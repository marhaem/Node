/*jshint esnext:true */

/*
Content = Controller
Content uses Components
Content receives and passes down routes
  - to SubPages
  - to Components
Content sets basic Layout
  - Mounting Points
*/

import riot from 'riot';

import {Root} from './routes/root';

let content = null;

export let Routes = {
  init: function init(node) {
    if (content === null) {
      content = riot.mount(node, Root.tagName, {});
      content = content ? content[0] : null;
    }
  },
  onRouteHit: function onRouteHit(route, index, params) {
    if (content !== null) {
      content.onRouteHit(route, index, params);
    }
  }
};
