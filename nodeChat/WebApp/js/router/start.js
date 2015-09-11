/*jshint esnext:true */

import riot from 'riot';

import {onRoute} from './internal/onRoute';
import {parser} from './internal/parser';
import {hash} from './hash';

export function start(initial, receiver) {
  riot.route.parser(parser);
  riot.route(function() {
    let route = [];
    Array.prototype.push.apply(route, arguments);
    let params = route.pop();
    onRoute(receiver, route, params);
  });
  riot.route(hash(initial));
}