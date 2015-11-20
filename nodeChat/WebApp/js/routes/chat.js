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
  '<div name="messagesCon" class="messages"></div>' +
  '</div>' +
  '<div name="alert"></div>' +
  '<div class="chat-page">' +
  '<div name="form" class="chat-page-form"></div>' +
  '</div>',
  function (opts) {
    let api = null;
    let messages;
    let scroll = true;
    let self = this;

    /**
     * fetch messages periodically
     */
     // TODO Add function to check for new messages automatic every 5-10 seconds
    let tick = function tick() {};

    let addMessages = function addMessages(msgs) {
      self.messageContainer.add(msgs);

      // //@TODO add message button at new message
      // if (scroll) {
      //   $(this.messages).scrollTop($(this.messages)[0].scrollHeight);
      // } else {
      //   $('#messageAlert').css('display', 'block');
      // }
      $(self.messagesCon).scrollTop(1E10);
    }

    $(this.messages).scroll(function () {
      if ($(this)[0].scrollHeight - $(this).scrollTop() == $(this).outerHeight()) {
        scroll = true;
        $('#messageAlert').css('display', 'none');
      } else {
        scroll = false;
      }
    });

    this.send = function send(text) {
      api.send(text).then(
        function onResolved(msgs) {
          addMessages(msgs);
        },
        function onRejected(error) {
          console.error(error);
        }
      );
    };

    // riot events
    this.on('mount', function () {
      api = new ChatApi();
      api.fetch().then(
        function onResolved(msgs) {
          console.warn(msgs);
          self.messageContainer = riot.mount(self.messagesCon, 'chat-message-container', {
            master: self,
            items: msgs
          });
          console.log(self.messageContainer);
          self.messageContainer = self.messageContainer ? self.messageContainer[0] : null;

          self.inputSubmit = riot.mount(self.form, 'chat-input-submit', {
            master: self
          });
          self.inputSubmit = self.inputSubmit ? self.inputSubmit[0] : null;

          riot.mount(self.alert, 'chat-message-alert', {});
          $(self.messagesCon).scrollTop(1E10);
        },
        function onRejected(error) {
          console.log("There was an error fetching the messages: " + error);
        }
      );
    });
  }
);

export let Chat = {
  tagName: 'content-chat'
};
