/*jshint esnext:true, -W014 */

import i18n from 'i18next-client';
import riot from 'riot';

import './login/form';

import {RouteableComponent} from '../router/RouteableComponent';

import {NotFound404} from './notFound404';

let routes = {
  '/404/': NotFound404
};

riot.tag(
  'content-login',
  '<div class="login-page">' +
    '<div name="form"></div>',
  '</div>',
  function(opts) {
    this.on('mount', function() {
      riot.mount(this.form, 'login-form', opts.form);
    });

    RouteableComponent.bind(this);

    this.onRouteHit = function onRouteHit(parts, index, params) {
      this.Routeable.next(parts, index, params, routes, this.content);
    };
  }
);

export let Login = {
  tagName: 'content-login'
};