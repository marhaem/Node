/*jshint esnext:true */

import i18n from 'i18next-client';
import riot from 'riot';

import {RouteableComponent} from '../router/RouteableComponent';

import {NotFound404} from './notFound404';
import {Chat} from './chat';
import {Login} from './login';

let subroutes = {
  '/404/': NotFound404,   // special route, routes cannot contain '/' normally
  'chat': Chat,
  'login': Login
};

let id = -1;

riot.tag(
  'content-root',
  '<nav class="navbar navbar-default navbar-static-top">'+
      '<div class="container">'+
        '<div class="navbar-header">'+
          '<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar{ id }" aria-expanded="false" aria-controls="navbar{ id }">'+
            '<span class="sr-only">Toggle navigation</span>'+
            '<span class="icon-bar"></span>'+
            '<span class="icon-bar"></span>'+
            '<span class="icon-bar"></span>'+
          '</button>'+
          '<a class="navbar-brand" href="#login">MoWS</a>'+
        '</div>'+
        '<div id="navbar{ id }" class="navbar-collapse collapse">'+
          '<ul class="nav navbar-nav navbar-right">'+
            '<li each="{ item in opts.items }" class="{ item.active === true ? \'active\' : null }">'+
              '<a href="#{ item.href }">{ item.title }</a>'+
            '</li>'+
          '</ul>'+
        '</div>'+
      '</div>'+
    '</nav>' +
  '<div class="container-fluid">' +
    '<div name="content"></div>' +
  '</div>',
  function(opts) {
    ++id;

    opts.items = [{
      href: 'chat',
      title: 'Chat'
    }, {
      href: 'login',
      title: 'Login'
    }];

  // routing events
    RouteableComponent.bind(this);

    this.onRouteHit = function onRouteHit(route, index, params) {
      let i = -1;
      let len = opts.items.length;
      let hit = route.slice(0, index + 1).join('/');

      while (++i < len) {
        opts.items[i].active = (opts.items[i].href === hit);
      }

      this.update();

      this.Routeable.next(route, index, params, subroutes, this.content);
    };
  }
);

export let Root = {
  tagName: 'content-root'
};