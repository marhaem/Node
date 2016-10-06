/*jshint esnext:true */

import riot from 'riot';

import {parser} from './internal/parser';
import {hash} from './hash';

export function start(initial, root) { // ('login', Routes)
  // parser
  riot.route.parser(parser);

  // listener
  riot.route(function() {
    // receive route parts and params
    let route = [];
    Array.prototype.push.apply(route, arguments);
    let params = route.pop();

    // pass down to root, route depth is zero
    root.onRouteHit(route, 0, params);
  });

  // set route to initial hash (also triggers listener)
  riot.route(hash(initial));
}
