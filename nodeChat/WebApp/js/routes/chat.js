/*jshint esnext:true, -W014 */

import i18n from 'i18next-client';
import riot from 'riot';

import './chat/form';
import './chat/message';

import {RouteableComponent} from '../router/RouteableComponent';

import {NotFound404} from './notFound404';

let routes = {
  '/404/': NotFound404
};

riot.tag(
  'content-chat',
  '<div class="row messageIncome">' +
   '<div name="messages"></div>' +
  '</div>' +
  '<div class="chat-page">' +
    '<div name="form" style="position: absolute; bottom: 5px; right: 5px; left: 5px;"></div>' +
  '</div>',
  function(opts) {
    this.on('mount', function() {
      riot.mount(this.messages, 'chat-message',{ items: [{
          active: false,
          message: 'Message -> True',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: true,
          message: 'Message -> false',
          sender: 'neumaierm',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: false,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      },{
          active: true,
          message: 'Message -> false',
          sender: 'wagnera',
          timestamp: '1234'
      }] });
      riot.mount(this.form, 'chat-form', opts.form);

    });

    RouteableComponent.bind(this);

    this.onRouteHit = function onRouteHit(parts, index, params) {
      this.Routeable.next(parts, index, params, routes, this.content);
    };
  }
);

export let Chat = {
  tagName: 'content-chat'
};