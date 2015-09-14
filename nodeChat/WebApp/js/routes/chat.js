/*jshint esnext:true, -W014 */

import i18n from 'i18next-client';
import riot from 'riot';

import './chat/chat-input-submit';
import './chat/chat-message-container';

import {
  NotFound404
}
from './notFound404';

import {
  Chat as ChatApi
}
from '../api/chat';

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

    /**
     * fetch messages periodically
     */
    let tick = function tick() {};

    let addMessages = function addMessages(msgs) {
      let len = msgs.length;
      let i = -1;

      while (++i < len) {
        messages.push(msgs[i]);
      }

      this.messageContainer.update();

      //@TODO: + autoscroll down
      //@TODO: + no autoscroll if user scrolled up
    }.bind(this);

    this.send = function send(text) {
      let result = api.send(text);
      addMessages(result);
    };

  // riot events
    this.on('mount', function () {
      api = new ChatApi(this);
      messages = api.fetch();

      this.messageContainer = riot.mount(this.messages, 'chat-message-container', {
        master: this,
        items: messages
      });
      this.messageContainer = this.messageContainer ? this.messageContainer[0] : null;

      this.inputSubmit = riot.mount(this.form, 'chat-input-submit', {
        master: this
      });
      this.inputSubmit = this.inputSubmit ? this.inputSubmit[0] : null;
    });
  }
);

export let Chat = {
  tagName: 'content-chat'
};
