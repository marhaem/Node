/*jshint esnext:true, -W014 */

import i18n from 'i18next-client';
import riot from 'riot';
import $ from 'jquery';

import './chat/chat-input-submit';
import './chat/chat-message-container';
import './chat/chat-message-alert';

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
  '<div name="messages" class="col-lg-8 col-lg-offset-2 messages" id="messages"></div>' +
  '</div>' +
  '<div name="alert"></div>' +
  '<div class="chat-page">' +
  '<div name="form" class="col-lg-8 col-lg-offset-2 chat-page-form"></div>' +
  '</div>',
  function (opts) {
    let api = null;
    let messages;
    let scroll = true;

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

      //@TODO if !scroll show little button to scroll down at touch (new messages)
      if (scroll) {
        $(this.messages).scrollTop($(this.messages)[0].scrollHeight);
      } else {
        $('#messageAlert').css('display', 'block');
      }

    }.bind(this);



    $(this.messages).scroll(function () {
      if ($(this)[0].scrollHeight - $(this).scrollTop() == $(this).outerHeight()) {
        scroll = true;
        $('#messageAlert').css('display', 'none');
      } else {
        scroll = false;
      }
    });

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

      riot.mount(this.alert, 'chat-message-alert', {});

    });
  }
);

export let Chat = {
  tagName: 'content-chat'
};
