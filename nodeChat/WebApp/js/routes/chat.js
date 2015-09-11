/*jshint esnext:true, -W014 */

import i18n from 'i18next-client';
import riot from 'riot';

import {RouteableComponent} from '../router/RouteableComponent';

import {NotFound404} from './notFound404';

let routes = {
  '/404/': NotFound404
};

riot.tag(
  'content-chat',
  '<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">' +
    '<div name="sidebar"></div>' +
    '<div name="content"></div>' +
  '</div>',
  function(opts) {
    RouteableComponent.bind(this);

    this.onRouteHit = function onRouteHit(parts, index, params) {
      //

      this.Routeable.next(parts, index, params, routes, this.content);
    };
  }
);

export let Chat = {
  tagName: 'content-chat'
};