/*jshint esnext:true, -W014 */

import i18n from 'i18next-client';
import riot from 'riot';

import './chat/form';
import './chat/message';

import {
  RouteableComponent
}
from '../router/RouteableComponent';

import {
  NotFound404
}
from './notFound404';

import {
  Chat as ChatApi
}
from '../api/chat';

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
  function (opts) {
    let api = null;
    let messages;

    // riot events
    this.on('mount', function () {
      api = new ChatApi(this);
      messages = api.fetch();

      this.tagMessages = riot.mount(this.messages, 'chat-message', {
        master: this,
        items: messages
      });
      this.tagMessages = this.tagMessages ? this.tagMessages[0] : null;

      this.tagForm = riot.mount(this.form, 'chat-form', {
        master: this
      });
      this.tagForm = this.tagForm ? this.tagForm[0] : null;
    });

    // custom
    this.send = function send(text) {
      let result = api.send(text);
      addMessages(result);
    };

    /**
     * fetch messages periodically
     */
    let tick = function tick() {}

    let addMessages = function addMessages(msgs) {
      let len = msgs.length;
      let i = -1;

      while (++i < len) {
        messages.push(msgs[i]);
      }

      this.tagMessages.update();

      // + autoscroll down
      // + no autoscroll if user scrolled up
    }.bind(this);
  }
);

export let Chat = {
  tagName: 'content-chat'
};
